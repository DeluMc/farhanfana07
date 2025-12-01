const openUpload = document.getElementById("open-upload");
const modal = document.getElementById("upload-modal");
const closeUpload = document.getElementById("close-upload");
const uploadBtn = document.getElementById("upload-btn");

openUpload.onclick = () => modal.classList.remove("hidden");
closeUpload.onclick = () => modal.classList.add("hidden");

// === Upload Proses ===
uploadBtn.onclick = async () => {
  const title = document.getElementById("up-title").value;
  const cat = document.getElementById("up-cat").value;
  const desc = document.getElementById("up-desc").value;
  const imgFile = document.getElementById("up-image").files[0];
  const mainFile = document.getElementById("up-file").files[0];

  if (!title || !mainFile) {
    alert("Judul & File utama wajib diisi!");
    return;
  }

  // upload file utama
  const mainRef = storage.ref("files/" + Date.now() + "_" + mainFile.name);
  await mainRef.put(mainFile);
  const mainURL = await mainRef.getDownloadURL();

  // upload gambar
  let imgURL = "";
  if (imgFile) {
    const imgRef = storage.ref("preview/" + Date.now() + "_" + imgFile.name);
    await imgRef.put(imgFile);
    imgURL = await imgRef.getDownloadURL();
  }

  // simpan metadata ke Firestore
  await db.collection("items").add({
    title,
    category: cat,
    description: desc,
    preview: imgURL,
    file: mainURL,
    created: Date.now()
  });

  alert("Upload berhasil!");

  modal.classList.add("hidden");
  loadItems();
};

// === Load Data ===
async function loadItems() {
  const list = document.getElementById("list");
  list.innerHTML = "Loading...";

  const snap = await db.collection("items").orderBy("created", "desc").get();

  list.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();

    const card = `
      <div class="card">
        <div class="thumb">
          <img src="${d.preview || 'https://via.placeholder.com/150'}">
        </div>
        <div class="meta">
          <h3>${d.title}</h3>
          <p>${d.category}</p>
          <p>${d.description}</p>
          <a class="download" href="${d.file}" target="_blank">Download</a>
        </div>
      </div>
    `;

    list.insertAdjacentHTML("beforeend", card);
  });
}

loadItems();
