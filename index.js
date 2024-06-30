//DECLARATION DES CONSTANTES POUR LA VIDEO ET LA RECONNAISSANCE DANS LA VIDEO
let video = document.getElementById("video");
let canvasVideo = document.getElementById("canvasVideo");
let ctxVideo = canvasVideo.getContext("2d");
const resultsVideo = document.getElementById("results");
const predictionsDiv = document.getElementById("predictions");

//DECLARATION DE CONSTANTES POUR LES CAPTURES D'ECRAN
canvasImage = document.getElementById("images");
let ctxImage = canvasImage.getContext("2d");
let captureButton = document.getElementById("capture");
let predictionsElement = document.getElementById("predictionsImage");
const startButton = document.getElementById("startButton");

//LISTE DES CAPTURES D'ECRAN
let capturedImages = document.getElementById("captured-images");

let filterResult = document.getElementById("filterResult");
const objClassDiv = document.getElementById("objClass");

//COPIE DE LA VIDEO
startButton.addEventListener("click", async () => {
  await loadModel();
  setupCamera();

  //DETECTION DES OBEJTS DANS LA COPIE DE LA VIDEO
  async function detectObjectsVideo() {
    const predictions = await model.detect(canvasVideo);
    predictionsDiv.innerHTML = "";
    console.log(predictions);
    predictions.forEach((prediction) => {
      // Pour chaque prediction, je commence un nouveau tracé
      ctxVideo.beginPath();
      ctxVideo.rect(...prediction.bbox);
      ctxVideo.lineWidth = 2;
      ctxVideo.strokeStyle = "red";
      ctxVideo.fillStyle = "red";
      ctxVideo.stroke();
      ctxVideo.fillText(
        `${prediction.class}`,
        prediction.bbox[0],
        prediction.bbox[1]
      );
      predictionsDiv.innerHTML += prediction.class+'&nbsp';
    });
  }

  video.addEventListener("play", async () => {
    function copievideo() {
      ctxVideo.drawImage(video, 0, 0, canvasVideo.width, canvasVideo.height);
      requestAnimationFrame(copievideo);
      detectObjectsVideo();
    }
    requestAnimationFrame(copievideo);
  });
});

let selectedDevice = "";

//RECUPERATION DE LA WEBCAM ET INTEGRATION DANS LA PAGE
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: selectedDevice.deviceId ? { exact: selectedDevice } : true,
    },
  });

  console.log("selectedDevice", selectedDevice);

  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
  };
}

//SWITCH DU MODE JOUR/NUIT AU CHANGEMENT DU TOGGLE

window.onload = function () {
  initializeMode();
};

document.getElementById("mode-switch").addEventListener("change", function () {
  updateMode();
});

function initializeMode() {
  if (document.getElementById("mode-switch").checked) {
    document.body.classList.add("night-mode");
    document.body.classList.remove("day-mode");
  } else {
    document.body.classList.add("day-mode");
    document.body.classList.remove("night-mode");
  }
}

function updateMode() {
  if (document.getElementById("mode-switch").checked) {
    document.body.classList.add("night-mode");
    document.body.classList.remove("day-mode");
  } else {
    document.body.classList.add("day-mode");
    document.body.classList.remove("night-mode");
  }
}

//REDIMENSIONNER LA TAILLE DU CANVAS VIDEO POUR QU'ELLE SOIT EGALE A CELLE DE LA VIDEO
document.addEventListener("DOMContentLoaded", function () {
  function matchCanvasToVideoSize() {
    canvasVideo.width = video.videoWidth;
    canvasVideo.height = video.videoHeight;
  }

  video.addEventListener("loadedmetadata", matchCanvasToVideoSize);
  window.addEventListener("resize", matchCanvasToVideoSize);

  // Ensure initial size match if video is already loaded
  if (video.readyState >= 1) {
    matchCanvasToVideoSize();
  }
});

//OPEN ET CLOSE DE LA FENETRE MODAL PERMETTANT D'ENVOYER UN EMAIL

document.getElementById("btn-modal").addEventListener("click", () => {
  document.getElementById("myModal").style.display = "block";
});
document.getElementById("submit-email").addEventListener("click", () => {
  document.getElementById("myModal").style.display = "none";
});

document.getElementById("submit-email-cancel").addEventListener("click", () => {
  document.getElementById("myModal").style.display = "none";
});

//RECONNAISSANCE ET AFFICHAGE DES DIFFERENTES WEBCAM DISPONNIBLES

async function getConnectedDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();

  let cameraList = "<div id='camSelect'><select id='camList'><option></option>";
  devices.forEach((device) => {
    if (device.deviceId !== "") {
      cameraList += `<option value='${device.label}'>${device.label}</option>`;
    }
  });
  cameraList += "</select></div>";

  let span = document.createElement("span");
  span.innerHTML = cameraList;

  resultsVideo.appendChild(span);
  span.addEventListener("change", async () => {
    let camType = await document.getElementById("camList").value;

    console.log("camType ", camType);
    const deviceConnected = devices.filter(
      (device) => device.label === camType
    );
    selectedDevice = deviceConnected;
    console.log("deviceConnected", deviceConnected);
    setupCamera();
  });
}
const videoCameras = getConnectedDevices();
console.log("Cameras found:", videoCameras);

//FONCTIONNALITE CAPTURE D'ECRAN AVEC DETECTION DES OBJETS DANS CHAQUE CAPTURE
//Chargement du modele COCO-SSD
let model;
async function loadModel() {
  model = await cocoSsd.load();
  console.log("Modèle COCO-SSD chargé.");
}
loadModel();

//Léa:  Capture objets détecté
captureButton.addEventListener("click", () => {
  ctxImage.drawImage(video, 0, 0, canvasImage.width, canvasImage.height);
  canvasImage.style.display = "none"; //canvas capturé n'est pas visible
  detectObjects().then(() => {
    afficherCapturedImage(); // seul la list de capture objets détecté est visible
  });
});

async function detectObjects() {
  const predictions = await model.detect(canvasImage);
  predictionsElement.innerHTML = "";
  predictions.forEach((prediction) => {
    drawBoundingBox(prediction);
    let img = canvasImage.toDataURL('image/png');
    saveData(img,prediction);
  });
}

function drawBoundingBox(prediction) {
  ctxImage.beginPath();
  ctxImage.rect(...prediction.bbox);
  ctxImage.lineWidth = 2;
  ctxImage.strokeStyle = "red";
  ctxImage.fillStyle = "red";
  ctxImage.stroke();
  ctxImage.fillText(
    `${prediction.class} - ${Math.round(prediction.score * 100)}%`,
    prediction.bbox[0],
    prediction.bbox[1]
  );
}
//Lea : list capture objets dectecté- METHODE canvas.toDataURL()
//On peut enregistrer automatiquement l’image en créant un lien
//et en attachant la valeur src comme href du lien.
function afficherCapturedImage() {
  const img = document.createElement("img");
  img.src = canvasImage.toDataURL();
  capturedImages.appendChild(img);
  document.getElementById('titre-captures').classList.remove('hidden');
  document.getElementById('titre-captures').style.display = 'block';

}

// FILTRAGE PAR DIFFERENT CLASS D'OBJET
const objClassList = [
  "Person",
  "Voiture",
  "Maison",
  "Arbes",
  "Animal",
  "Avion",
  "Bateau",
  "Cell phone",
  "Ordinateur",
];
let htmlObjClass = ``;
//Creating checkbox with different filter class
objClassList.forEach((list) => {
  htmlObjClass += `<div class="checkbox-item">
        <input type="checkbox" id="${list}" name="${list}" value="${list}">
        <label for="${list}"> ${list}</label>
    </div>`;
});
objClassDiv.innerHTML += htmlObjClass;
let selectedFilter = document.getElementById("objClass");
let filters = [];
selectedFilter.addEventListener("change", (e) => {
  filterResult.innerHTML = " ";
  filters.includes(e.target.value)
    ? (filters = filters.filter((element) => element !== e.target.value))
    : filters.push(e.target.value);
  console.log("filters", filters);

  document.getElementById('titre-filtrage').style.display = 'none';
  document.getElementById('titre-filtrage').classList.add('hidden');
  let filterDiv = "";
  filters.forEach((filter) => {
    filter = filter.toLowerCase();
    // for all the filters selected, check the predictions for the selected filters availability.
    let connection = window.indexedDB.open("predictionDB", 3);
    connection.onerror = function (e) {
      // Faire quelque chose avec connection.errorCode !
      console.log("theres error ", e);
    };
    connection.onsuccess = function (e) {
      const db = e.target.result;
      const transaction = db.transaction(["predictionTable"], "readonly");
      const objectStore = transaction.objectStore("predictionTable");
      const getAll = objectStore.getAll();
      getAll.onsuccess = function (evt) {
        const datas = evt.target.result;
        if (datas) {
          console.log("Retrieved data:", datas);
          let fCap = filter.charAt(0).toUpperCase() + filter.slice(1);
          const idFiltre = document.getElementById(fCap);
          for (let index = 0; index < datas.length; index++) {
            if (
              datas[index][1].predictions.class === filter.toLowerCase() &&
              idFiltre.checked
            ) {
              console.log("inside if");
              filterDiv += `<div id='result' class="capture-card"><img id='filtreImg' src='${datas[index][0].imgDB}'/></div>`;
              document.getElementById('titre-filtrage').classList.remove('hidden');
              document.getElementById('titre-filtrage').style.display = 'block';
            }
          }
        }
        filterResult.innerHTML = filterDiv;
      };
    };
  });
});

// INDEXED DB:- Saving data in indexedDB
async function saveData(img, pre) {
  let prediction = pre;
  let imgDB = img;

  let connection = window.indexedDB.open("predictionDB", 3);
  connection.onerror = function (e) {
    // Faire quelque chose avec connection.errorCode !
    console.log("theres error ", e);
  };
  connection.onsuccess = function (e) {
    //update of the db if necessary is over here
    const db = e.target.result;
    let predictionToSave = [{ imgDB: imgDB }, { predictions: prediction }];
    // Store values in the DB already present
    const predictionObjectStore = db
      .transaction("predictionTable", "readwrite")
      .objectStore("predictionTable");

    predictionObjectStore.put(predictionToSave);
  };
  connection.onupgradeneeded = function (e) {
    const db = e.target.result;
    //Creation of DB only if it doent exist already.
    if (!db.objectStoreNames.contains("predictionTable")) {
      db.createObjectStore("predictionTable", {
        keyPath: "compteurDb",
        autoIncrement: true,
      });
    }
  };
}
