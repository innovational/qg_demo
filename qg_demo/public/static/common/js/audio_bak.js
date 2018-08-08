const startBtn = document.getElementById('say');
const stopBtn = document.getElementById('over—say');

let recordRTC;

const startRecording = () => {
    startBtn.disabled = true;
    navigator.getUserMedia({
        audio: true,
        video : false
    }, (stream) => {
    recordRTC = RecordRTC(stream, { bufferSize: 16384, type : 'audio' });
    recordRTC.startRecording();
    stopBtn.disabled = false;
}, (error) => {
        alert(JSON.stringify(error));
        console.error(error);
    });
};

const stopRecording = () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    recordRTC.stopRecording(() => {

    const file = new File([recordRTC.getBlob()], `${Date.now()}.ogg`);
    //console.log(file);
    uploadToServer(recordRTC, function(progress, fileURL){
        if(progress === 'ended') {

            return;
        }

    });
    //a File object can be easily uploaded to any server
    //https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
});
};

startBtn.onclick = startRecording;
stopBtn.onclick = stopRecording;

//上传到服务器
function uploadToServer(recordRTC, callback) {
    var blob = recordRTC instanceof Blob ? recordRTC : recordRTC.blob;
    var fileType = blob.type.split('/')[0] || 'audio';
    var fileName = (Math.random() * 1000).toString().replace('.', '');

    if (fileType === 'audio') {
        fileName += '.' + (!!navigator.mozGetUserMedia ? 'ogg' : 'wav');
    } else {
        fileName += '.webm';
    }

    // create FormData
    var formData = new FormData();
    formData.append(fileType + '-filename', fileName);
    formData.append(fileType + '-blob', blob);

    callback('Uploading ' + fileType + ' recording to server.');

    makeXMLHttpRequest(save_audio_url, formData, function(progress) {
        if (progress !== 'upload-ended') {
            callback(progress);
            return;
        }
    });
}

//异步上传
function makeXMLHttpRequest(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            var reObj = eval('(' + request.response + ')');
            $("#audio_src").val(reObj.data);
            callback('upload-ended');
        }
    };

    request.upload.onloadstart = function() {
        callback('Upload started...');
    };

    request.upload.onprogress = function(event) {
        callback('Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%");
    };

    request.upload.onload = function() {
        callback('progress-about-to-end');
    };

    request.upload.onload = function() {
        callback('progress-ended');
    };

    request.upload.onerror = function(error) {
        callback('Failed to upload to server');
        console.error('XMLHttpRequest failed', error);
    };

    request.upload.onabort = function(error) {
        callback('Upload aborted.');
        console.error('XMLHttpRequest aborted', error);
    };

    request.open('POST', url);
    request.send(data);
}
