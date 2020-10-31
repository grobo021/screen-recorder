const { desktopCapturer, remote } = require('electron')
const { Menu, dialog } = remote;
const { writeFile } = require('fs');

const videoEl = document.querySelector('#recording');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

let mediaRecorder;
const recordedChunks = [];

const handleDataAvailable = (e) => { recordedChunks.push(e.data); }; // blablabla

const handleStop = async (e) => {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  });

  if (filePath) {
    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
  }
};

const selectSource = async (source) => {
  videoSelectBtn.innerText = source.name;

  const consraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  const stream = await navigator.mediaDevices
    .getUserMedia(consraints);
  
  videoEl.srcObject = stream;
  videoEl.play();

  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options); // hi stream :)

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

const getVideoSources = async () => {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => ({
      label: source.name,
      click() { selectSource(source) }
    }))
  );

  videoOptionsMenu.popup()
};

videoSelectBtn.addEventListener('click', getVideoSources);

startBtn.onclick = e => {
  mediaRecorder.start(0);
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};
