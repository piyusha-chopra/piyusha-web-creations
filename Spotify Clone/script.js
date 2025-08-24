let currentSong=new Audio();
let songs;

let currentFolder;

async function getSongs(folder) {
    currentFolder=folder
    let a =await fetch (`/${folder}/`)
    let response=await a.text()
    
    let div=document.createElement("div")
    div.innerHTML=response;
    let s=div.getElementsByTagName("a")
    songs=[]
    for (let index = 0; index < s.length; index++) {
        const element = s[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }

    // songs in playlist
    let songUL=document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUL.innerHTML="" ;
    for (const song of songs){
        songUL.innerHTML=songUL.innerHTML + `<li> <i class="fa-solid fa-music"></i>
                            <div class="info">
                                <div class="songName">${song.replaceAll("%20"," ")}</div>
                            </div>
                            <div class="playNow">
                                <img src="svg/start.svg">
                                <h6>Play Now</h6>
                            </div>
                        </li>`;
      
    }
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
       
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })

    return songs

}

const playMusic=(track,pause=false)=>{
    currentSong.src=`/${currentFolder}/`+ track
    if(!pause){
        currentSong.play()
        start.src="svg/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML=decodeURI(track);
    document.querySelector(".currentTime").innerHTML="00:00"
    document.querySelector(".totalTime").innerHTML="00:00"
}

async function displayAlbums(){
    let a =await fetch(`/songs/`)
    let response=await a.text()
 
    let div=document.createElement("div")
    div.innerHTML=response;
    let anch=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anch)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0]

            let a =await fetch(`/songs/${folder}/info.json`)
            let response=await a.json()
        
            cardContainer.innerHTML=cardContainer.innerHTML+`<div data-folder="${folder}" class="card">
                    <div class="play">
                        <img class="playButton" src="svg/play.svg">
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="cover">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
 
        }
        
    }
     //Loading the songs with different albums
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        
        e.addEventListener("click",async item=>{
            
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)

            //display the first song of album clicked

            if (currentSong.paused){
                playMusic(songs[0],true); //just load the info , don't autoplay
            }
            else{
                playMusic(songs[0]);  //autoplay if the song is already playing
            }
           
            

            
    
            // opening library panel

            document.querySelector(".left").style.left="0"
            
        })
    })
        
    }
    

async function main() {

    
    // Get the list of songs
    await getSongs("songs/Ambient")
    playMusic(songs[0],true)

    //displaying albums
    displayAlbums()

    
    start.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            start.src="svg/pause.svg"
            
        }
        else{
            currentSong.pause()
            start.src="svg/start.svg"
        }
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        
        if(document.querySelector(".hamburger").getAttribute("src")=="svg/hamburger.svg"){
            document.querySelector(".hamburger").setAttribute("src",'svg/close.svg')
            document.querySelector(".hamburgerList").style.display="block"
        }
        else{
            document.querySelector(".hamburger").setAttribute("src","svg/hamburger.svg");
            document.querySelector(".hamburgerList").style.display="none"
        }
    })


    document.querySelector(".close").addEventListener("click",()=>{
    
            document.querySelector(".left").style.left="-100%"
    })
  

    // previous and next music buttons
    previous.addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }

    })
    next.addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        
        if((index+1)<(songs.length)){
            playMusic(songs[index+1])
        }
        

    })

    //Adding Event to volume
    document.querySelector(".volumeControl").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
 
        currentSong.volume=parseInt(e.target.value)/100;

    })

    //add event listener to mute 
    document.querySelector(".volumeButton img").addEventListener("click",e=>{
        if(e.target.src.includes("svg/volume.svg")){
            e.target.src=e.target.src.replace("svg/volume.svg","svg/mute.svg")
            currentSong.volume=0
            document.querySelector(".volumeControl").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("svg/mute.svg","svg/volume.svg")
            currentSong.volume=0.10
            document.querySelector(".volumeControl").getElementsByTagName("input")[0].value=0.10   
        }

    })


    //Time update
    // function to format seconds into MM:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00"; // for when duration is not loaded yet
        let minutes = Math.floor(seconds / 60);
        let secs = Math.floor(seconds % 60);
        if (secs < 10) secs = "0" + secs; // add leading zero if < 10
        return `${minutes}:${secs}`;
    }

    currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".currentTime").innerHTML=formatTime(currentSong.currentTime),
            document.querySelector(".totalTime").innerHTML=formatTime(currentSong.duration),
            document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration)*100+"%"
        
    });

    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left=percent+"%"
        currentSong.currentTime=((currentSong.duration)*percent)/100
           
    })

   

}
main()
