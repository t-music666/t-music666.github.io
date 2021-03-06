/*
design by Voicu Apostol.
design: https://dribbble.com/shots/3533847-Mini-Music-Player
I can't find any open music api or mp3 api so i have to download all musics as mp3 file.
You can fork on github: https://github.com/muhammederdem/mini-player
*/

// function m(x){
//   r={}
//   if(mapping[x]){
//     r["name"] = mapping[x]['title']
//     r["source"] = "music/"+mapping[x]['FEx']+mapping[x]['id']+"."+mapping[x]['FEx']
//     r["cover"] = "thumbnail/"+mapping[x]['id']+".jpg"
//     r["favorited"] = "False"
//     r["artist"] =  ""
//   }
//   return r
// }
timer = 0
ntrackList = [{name:"",source:"",cover:"",favorited:"",artist:""}]

function settracks(){
  // ntrackList = trackList.map(x =>m(x.substr(3)))
  ntrackList = []
  trackList.forEach(x =>{
    if(mapping[x]){
      r={}
      r["name"] = mapping[x]['title']
      r["source"] = "music/"+mapping[x]['FEx']+mapping[x]['id']+"."+mapping[x]['FEx']
      r["cover"] = "thumbnail/"+mapping[x]['id']+".jpg"
      r["favorited"] = "False"
      r["artist"] =  ""
      ntrackList.push(r)
    }
  });
  vu.tracks = ntrackList
  vu.init()
  
}
sleepTimer = null
var vu = new Vue({
  el: "#app",
  data() {
    return {
      audio: null,
      circleLeft: null,
      barWidth: null,
      VolumebarWidth: null,
      volume: 0,
      duration: null,
      currentTime: null,
      isTimerPlaying: false,
      tracks: ntrackList,
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null,
      wait :false,
      random: false,
      repeat: false,
      dialogChecked:false,
      settings: {
        maxLength: 100,
        length: 50,
        }
    };
  },
computed: {
    lengthThumbPosition: function() {
      volume = (( (this.settings.length) / (this.settings.maxLength)))
      this.audio.volume =volume  
      return volume*100;
    }
  },
  
  methods: {
    fetchVideoAndPlay() {
        if(protocol!= "file:"){
          try {
            // this.audio.src = this.currentTrack.source;
            // this.audio.load();
            wait = true;
            var request = new XMLHttpRequest();
            request.open("GET", this.currentTrack.source, true);
            request.responseType = "blob";
            audio =  this.audio;
            request.onload = function() {
              if(this.responseURL.search(vu.currentTrack.source)>0){
                  wait = false;
                if (this.status == 200) {
                  audio.src = URL.createObjectURL(this.response);
                  audio.load();
                  if(timer <60*60*2){
                  // if(timer <1*2){
                    audio.play();
                  }else{
                    vu.audio.pause();
                    vu.isTimerPlaying = false;
                    // console.log("??????????????????????????????????????????????????????????");
                    // myTimer = setTimeout(()=>{alert("??????????????????????????????????????????????????????????");clearTimeout(myTimer)}, 500);
                    this.dialogChecked = true
                    timer = 0;
                  }
                }
              }
            }
            request.send();
          } catch (error) {
            this.audio.src = this.currentTrack.source;
            this.audio.load();
            this.audio.play();
    
          }
      }else{
        this.audio.src = this.currentTrack.source;
        this.audio.load();
        if(timer <10){
          this.audio.play();
        }else{
          vu.audio.pause();
          vu.isTimerPlaying = false;
          console.log("??????????????????????????????????????????????????????????");
          // myTimer = setTimeout(()=>{alert("??????????????????????????????????????????????????????????");clearTimeout(myTimer)}, 500);
          this.dialogChecked = true
          timer= 0

        }
      }
    },
    play() {
      if (this.audio.paused) {
        if(!sleepTimer){
          sleepTimer = setInterval(function(){ timer+=1;}, 1*1000);
        }
        this.updateAslide();
        if(this.duration){
          this.audio.play();
        }else{
          this.fetchVideoAndPlay();
        }
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
        timer = 0;
      }
    },
    dialogPlay(){
      this.dialogChecked = false;
      this.play();
    },
    generateTime() {
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = width + "%";
      this.circleLeft = width + "%";
      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration - durmin * 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime - curmin * 60);
      if (durmin < 10) {
        durmin = "0" + durmin;
      }
      if (dursec < 10) {
        dursec = "0" + dursec;
      }
      if (curmin < 10) {
        curmin = "0" + curmin;
      }
      if (cursec < 10) {
        cursec = "0" + cursec;
      }
      this.duration = durmin + ":" + dursec;
      this.currentTime = curmin + ":" + cursec;
    },
    updateBar(x) {
      let progress = this.$refs.progress;
      let maxduration = this.audio.duration;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      this.barWidth = percentage + "%";
      this.circleLeft = percentage + "%";
      this.audio.currentTime = (maxduration * percentage) / 100;
      this.audio.play();
    },
    clickProgress(e) {
      this.isTimerPlaying = true;
      this.audio.pause();
      this.updateBar(e.pageX);
    },
    clickVolumeProgress(e) {
      this.updateVolumeBar(e.pageX);
    },
    updateVolumeBar(x) {
      let progress = this.$refs.progress;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      this.audio.volume = percentage / 100;
    },
    prevTrack() {
      this.transitionName = "scale-in";
      this.isShowCover = false;
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
      } else {
        this.currentTrackIndex = this.tracks.length - 1;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    nextTrack(e) {
      this.transitionName = "scale-out";
      this.isShowCover = false;
      if(!this.repeat || e){
        if (this.currentTrackIndex < this.tracks.length - 1) {
          this.currentTrackIndex++;
        } else {
          this.currentTrackIndex = 0;
        }
      }
      if(this.random){
        r = Math.floor(Math.random() * this.tracks.length) 
        this.currentTrackIndex = r;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    specialTrack(index) {
      if(index>=0 && index < this.tracks.length){
        this.transitionName = "scale-out";
        this.isShowCover = false;
        this.currentTrackIndex = index
        this.currentTrack = this.tracks[this.currentTrackIndex];
        this.resetPlayer();
      }
    },
    updateAslide(){
      $("#bg-artwork")[0].style = "background-image: url('"+this.currentTrack.cover+"');"
      $('.plSel').removeClass('plSel');
      $('#plList li:eq(' + this.currentTrackIndex + ')').addClass('plSel');
    },
    resetPlayer() {
      this.barWidth = 0;
      this.circleLeft = 0;
      this.audio.currentTime = 0;
      // this.audio.src = this.currentTrack.source;
      // this.audio.load();
      this.updateAslide();
      if(this.isTimerPlaying) {
        // this.audio.play();
        this.fetchVideoAndPlay();
      } else {
        this.audio.pause();
      }
    },
    favorite() {
      this.tracks[this.currentTrackIndex].favorited = !this.tracks[
        this.currentTrackIndex
      ].favorited;
    },
    clickRandom() {
      this.random = !this.random
    },
    clickRepeat() {
      this.repeat = !this.repeat
      if(this.random)
        this.random = !this.random
    },
    aslideList(){
        
      
      if(!$(".asideMenu.active").length){
        $(".asideMenu").toggleClass("active");
        $(".fa-chevron-right").toggleClass("rotate");
        setTimeout(()=>{$(".asideMenu")[0].style = 'display: none'}, 500);
      }else{
        $(".asideMenu")[0].style = 'display: block'
        
        setTimeout(()=>{
          $(".asideMenu").toggleClass("active");
          $(".fa-chevron-right").toggleClass("rotate");
        }, 10);
      }
    },
    selectTrack(event, index){
        var id = parseInt($(this).index());
        var id = index;
        if (id !== vu.currentTrackIndex  ) {
          vu.specialTrack(id);
        }
      }
    ,
    handleClick () {
      const event = window.event || arguments[0]
      this.left = event.layerX
    },
    handleMouse() {
      const drag = this.$refs.drag
      const event = window.event || arguments[0]
      const origin = event.clientX - drag.offsetLeft
      const bar = this.$refs.bar
      bar.onmousemove = () => {
        const event = window.event || arguments[0]
        this.left = event.clientX - origin
        window.getSelection
          ? window.getSelection().removeAllRanges()
          : document.selection.empty()
      }
      bar.onmouseup = () => {
        const event = window.event || arguments[0]
        this.left = event.layerX
        bar.onmousemove = null
      }
    },
    init(){
      this.currentTrack = this.tracks[0];
      this.resetPlayer()
    }  
  },
  created() {
    let vm = this;
    this.currentTrack = this.tracks[0];
    this.audio = new Audio();
    this.audio.src = this.currentTrack.source;
    // $('#plList li:eq(' + this.currentTrackIndex + ')').addClass('plSel');
    this.audio.ontimeupdate = function() {
      vm.generateTime();
    };
    this.audio.onloadedmetadata = function() {
      vm.generateTime();
    };
    this.audio.onended = function() {
      vm.nextTrack();
      this.isTimerPlaying = true;
    };

    // this is optional (for preload covers)
    for (let index = 0; index < this.tracks.length; index++) {
      const element = this.tracks[index];
      let link = document.createElement('link');
      link.rel = "prefetch";
      link.href = element.cover;
      link.as = "image"
      document.head.appendChild(link)
    }
  },
  mounted: function () {
      this.play,
      this.specialTrack,
      this.updateAslide,
      this.init,
      this.audio
  }
});
protocol = document.location.protocol
tag = document.location.hash.split("#")[1]
try{
  if(protocol!= "file:"){
    if(tag){
      try{
        $.get( "./data/"+tag+".js", function( data ) {
          eval(data)
          settracks()
        });
      }catch(err){
        console.log("err0: "+err)
        $.get( "./data/fullPlaylist.js", function( data ) {
          eval(data)
          settracks()
        });}
    }else{
      $.get( "./data/fullPlaylist.js", function( data ) {
        eval(data)
        settracks()
      });
    }
  }else{
    settracks()
  }
}catch(err){
  console.log("test4")
  console.log("err1: "+err)

}

//   var i = 0
//   $.each(trackList, function(key, value) {
//     var trackNumber = i,
//         trackName = value.name
//     i+=1
//     $('#plList').append('<li> \
//         <div class="plItem"> \
//             <span class="plNum">' + trackNumber + '.</span> \
//             <span class="plTitle">' + trackName + '</span> \
//         </div> \
//     </li>');
//   })

// $('#plList li').on('click', function () { 
//   var id = parseInt($(this).index());
//   if (id !== vu.currentTrackIndex  ) {
//     vu.specialTrack(id);
//   }
// })

// loadTrack = function (id) {
//   $('.plSel').removeClass('plSel');
//   $('#plList li:eq(' + id + ')').addClass('plSel');
//   npTitle.text(tracks[id].name);
//   index = id;
//   audio.src = mediaPath + tracks[id].file + extension;
//   updateDownload(id, audio.src);
// }
// updateDownload = function (id, source) {
//   player.on('loadedmetadata', function () {
//       $('a[data-plyr="download"]').attr('href', source);
//   });
// }
// playTrack = function (id) {
//   loadTrack(id);
//   audio.play();
// };