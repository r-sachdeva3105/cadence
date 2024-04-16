/*****************************************************************************

ITC5202 - Project 2
I declare that this assignment is my own work in accordance with Humber Academic Policy.
No part of this assignment has been copied manually or electronically from any other source.
(including web sites) or distributed to other students.

Group member Names: Rajat Sachdeva Pranav Panchal Smith Dias
Student IDs: N01605453 N01609997 N01607819

Date: April 7th, 2024

*****************************************************************************/

const clientId = '22958dddbadf4cd29d23655f16b37d75'
const clientSecret = '51be7faa8b10422ea6e3d1cc733548d4'
var token = ''

async function getToken() {

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json()
    token = data.access_token
    getGenres()
}

var genreList;

async function getGenres() {

    const result = await fetch(`https://api.spotify.com/v1/browse/categories`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    })

    const data = await result.json()
    genreList = data.categories.items
    displayGenre(genreList)
}

const genreDiv = $('.genre')

function displayGenre() {

    genreDiv.html('').css("display", "flex")

    genreList.forEach(genre => {
        const name = $(`<p>${genre.name}</p>`)
        const icon = genre.icons[0]
        const img = $('<img>').attr({ src: icon.url }).height(icon.height).width(icon.width)
        $('<div>').addClass(`${genre.id}`).append(img, name).appendTo(genreDiv)
    })
}

const searchInput = $('#search')

searchInput.on('change keydown paste input', function () {

    const genreElements = $('.genre div')

    const searchTerm = searchInput.val().toLowerCase()

    genreElements.each(function () {
        const genreName = $(this).find('p').text().toLowerCase()
        if (genreName.includes(searchTerm)) {
            $(this).show()
        } else {
            $(this).hide()
        }
    })
})

//function to reset the fields
function resetFields() {
    
    searchInput.val('');
    
    
    checkboxInput.prop('checked', false);
    console.log($('.playlists-grid').length)
     $('.playlists-grid').css('display', 'none');

    $('.playlists-grid').hide();
    
    // Display all genres
    displayGenre();
}

$('#resetButton').click(function() {
    resetFields();
});




const checkboxInput = $('#show')

checkboxInput.change(function() {

    if(this.checked) {
        displayPlaylists()
    } else {
        displayGenre()
    }
})

// Function to display tracks for a specific playlist
async function displayTracksForPlaylist(playlistId, playlistDiv) {
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    

    if (!result.ok) {
        console.error('Error fetching tracks:', result.statusText);
        return;
    }

    const data = await result.json();
    const tracks = data.items;

   if (tracks && tracks.length > 0) {
    const tracksList = document.createElement('ul');
    tracksList.classList.add('tracks-list');

    tracks.forEach(trackData => {
        const track = trackData.track;
        const trackItem = document.createElement('li');
        trackItem.classList.add('track-item');

        // Track name
        const trackName = document.createElement('h5');
        trackName.textContent = track.name ? track.name : 'No tracks Found';
        trackItem.appendChild(trackName);

        // Track artist
        const trackArtist = document.createElement('p');
        trackArtist.textContent = track.artists[0].name;
        trackArtist.classList.add('track-artist');
        trackItem.appendChild(trackArtist);

        // Track image
        const trackImage = document.createElement('img');
        trackImage.src = track.album.images[0].url;
        trackImage.alt = track.name;
        trackImage.classList.add('track-image');
        trackItem.appendChild(trackImage);

        tracksList.appendChild(trackItem);
    });

    playlistDiv.appendChild(tracksList);
} else {
    const noTracksMessage = document.createElement('p');
    noTracksMessage.textContent = 'No tracks found for this playlist';
    playlistDiv.appendChild(noTracksMessage);
}

}

// Function to display playlists for each genre
async function displayPlaylists() {
    genreDiv.html('').css("display", "block");

    for (const genre of genreList) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/browse/categories/${genre.id}/playlists`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) {
                throw new Error('Error fetching playlists');
            }

            const data = await response.json();
            const playlists = data.playlists.items;

            // Create a div for the genre
            const genreContainer = $('<div>').addClass('genre-container');

            // Name of the genre
            const genreName = $('<p>').text(genre.name).addClass('genre-name');

            // Genre image
            const genreImg = $('<img>').attr({ src: genre.icons[0].url }).height('200px').width('200px').addClass('genre-img');

            // Append the name of the genre above the image
            genreContainer.append(genreName, genreImg);

            // Create a grid for playlists
            const playlistsGrid = $('<div>').addClass('playlists-grid');

            for (const playlist of playlists) {
                const playlistDiv = $('<div>').addClass('playlist');
                const playlistName = $('<p>').text(playlist.name).addClass('playlist-name');
                const icon = playlist.images[0];
                const img = $('<img>').attr({ src: icon.url }).height('200px').width('200px');

                // Adding click event listener to open dialog box
                playlistDiv.click(() => {
                    openDialog(playlist.name, icon.url, playlist.id);
                });

                playlistDiv.append(img);
                playlistsGrid.append(playlistDiv);
            }

            // Append hr separator after each playlist
            playlistsGrid.find('.playlist').each(function() {
                $(this).after($('<hr>').addClass('horizontal-hr'));
            });

          
            genreContainer.append(playlistsGrid, $('<hr>'));

           
            genreDiv.append(genreContainer);
        } catch (error) {
            console.error('Error fetching playlists:', error.message);
        }
    }
}



// Function to open dialog box with track details
async function openDialog(playlistName, playlistImage, playlistId) {
    const dialog = document.getElementById('modal-tracks');
    const tracksContainer = document.getElementById('tracksDiv');

    // Clear previous track details
    tracksContainer.innerHTML = '';

    // Set playlist name and image
    const playlistHeader = document.createElement('h4');
    playlistHeader.textContent = playlistName;

    const playlistImg = document.createElement('img');
    playlistImg.src = playlistImage;
    playlistImg.alt = playlistName;

    tracksContainer.appendChild(playlistHeader);
    tracksContainer.appendChild(playlistImg);

    // Fetch and display track details
    await displayTracksForPlaylist(playlistId, tracksContainer);

    // Check if there are no tracks
    if (tracksContainer.querySelectorAll('.track-item').length === 0) {
        const noTracksMessage = document.createElement('p');
        noTracksMessage.textContent = 'No tracks found for this playlist';
        tracksContainer.appendChild(noTracksMessage);

        // Close the dialog box if there are no tracks
        dialog.close();
    } else {
        // Show dialog
        dialog.showModal();
    }

    // Close button
    const closeButton = document.getElementById('close');
    closeButton.addEventListener('click', () => {
        dialog.close();
    });
}







getToken()