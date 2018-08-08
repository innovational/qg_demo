  var audio_context;
  var recorder;
  const startBtn = document.getElementById('say');
  const stopBtn = document.getElementById('over—say');

  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    recorder = new Recorder(input);
  }

  function startRecording() {
    recorder && recorder.record();
  }

  function stopRecording() {
    recorder && recorder.stop();
	uploadToServer();
    
    recorder.clear();
  }
  
  startBtn.onclick = startRecording;
  stopBtn.onclick = stopRecording;
  
  function uploadToServer(){
	recorder && recorder.exportWAV(function(blob) {
		
		var fileType = 'wav';
		var fileName =  new Date().valueOf() + '.' + fileType;
		// var url = './upload.php';
		
		// create FormData
		var formData = new FormData();
		formData.append('name', fileName);
		formData.append('file', blob);
		
		var request = new XMLHttpRequest();
		// upload success callback
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				var reObj = eval('(' + request.response + ')');
				$("#audio_src").val(reObj.data);	
			}
		};
		// upload start callback
		request.upload.onloadstart = function() {
			console.log('Upload started...');
		};
		// upload process callback
		request.upload.onprogress = function(event) {
			console.log('Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%");
		};
		// upload error callback
		request.upload.onerror = function(error) {
			console.error('XMLHttpRequest failed', error);
		};
		// upload abort callback
		request.upload.onabort = function(error) {
			console.error('XMLHttpRequest aborted', error);
		};

		request.open('POST', save_audio_url);
		request.send(formData);
	});
  }

  window.onload = function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    
	navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
	
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      console.log('No live audio input: ' + e);
    });
  };