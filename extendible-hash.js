const bucketCapacityInput = document.getElementById("bucket-capacity");
const initBtn = document.getElementById("init-btn");
const elementValueInput = document.getElementById("element-value");
const insertBtn = document.getElementById("insert-btn");
const searchBtn = document.getElementById("search-btn");
const deleteBtn = document.getElementById("delete-btn");

const globalDepthSpan = document.getElementById("global-depth");
const directoryEntriesDiv = document.getElementById("directory-entries");
const bucketListDiv = document.getElementById("bucket-list");
const logOutput = document.getElementById("log-output");

let directory = { globalDepth: 0, pointers: [] };
let buckets = [];
let maxBucketCapacity = 2;
let nextBucketId = 0;

function log(message) {
  logOutput.textContent = message + "\n" + logOutput.textContent;
  console.log(message);
}

function renderDirectory() {
  globalDepthSpan.textContent = directory.globalDepth;
  directoryEntriesDiv.innerHTML = "";

  const numEntries = Math.pow(2, directory.globalDepth);
  for (let i = 0; i < numEntries; i++) {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("dir-entry");
    const bucketId = directory.pointers[i];
    entryDiv.textContent = `${i} -> Bucket ${bucketId}`;
    entryDiv.style.borderColor = getBucketColor(bucketId);
    directoryEntriesDiv.appendChild(entryDiv);
  }
}

function renderBuckets() {
  bucketListDiv.innerHTML = "";
  buckets.forEach((bucket) => {
    if (!bucket) return;

    const bucketDiv = document.createElement("div");
    bucketDiv.classList.add("bucket");
    bucketDiv.id = `bucket-${bucket.id}`;
    bucketDiv.style.borderColor = getBucketColor(bucket.id);

    const title = document.createElement("p");
    title.textContent = `Cesto ${bucket.id} (PL: ${bucket.localDepth})`;

    const content = document.createElement("p");
    content.textContent = `Elementos: [${bucket.elements.join(", ")}] (${
      bucket.elements.length
    }/${bucket.capacity})`;

    if (bucket.elements.length >= bucket.capacity) {
      bucketDiv.classList.add("full");
    }

    bucketDiv.appendChild(title);
    bucketDiv.appendChild(content);
    bucketListDiv.appendChild(bucketDiv);
  });
}

function getBucketColor(bucketId) {
  const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"];
  return colors[bucketId % colors.length];
}

function updateVisuals() {
  renderDirectory();
  renderBuckets();
}

function getHash(key, depth) {
  if (depth === 0) return 0;
  return Math.abs(parseInt(key)) % Math.pow(2, depth);
}

function initializeHashTable() {
  maxBucketCapacity = parseInt(bucketCapacityInput.value) || 2;
  directory.globalDepth = 0;
  nextBucketId = 0;

  const initialBucket = {
    id: nextBucketId++,
    localDepth: 0,
    elements: [],
    capacity: maxBucketCapacity,
  };
  buckets = [initialBucket];
  directory.pointers = [initialBucket.id];

  log(
    `Inicializado. Capacidade maxima: ${maxBucketCapacity}, PG: 0. Cesto 0 (PL:0) criado.`
  );
  updateVisuals();
}

function insertElement() {
  const value = elementValueInput.value;
  if (value === "") {
    log("ERRO: Valor do elemento nao pode ser vazio.");
    return;
  }
  const key = parseInt(value);
  if (isNaN(key)) {
    log("ERRO: Elemento deve ser um inteiro.");
    return;
  }

  log(`Tentando inserir a chave: ${key}`);

  let dirIndex = getHash(key, directory.globalDepth);
  let bucketId = directory.pointers[dirIndex];
  let targetBucket = buckets.find((b) => b.id === bucketId);

  if (!targetBucket) {
    log(
      `ERRO CRÍTICO: Nenhum cesto ${bucketId} a partir do índice do diretório ${dirIndex}`
    );
    return;
  }

  log(
    `A chave ${key} resulta no índice do diretório ${dirIndex}, que aponta para o Cesto ${targetBucket.id} (PL: ${targetBucket.localDepth})`
  );

  if (targetBucket.elements.includes(key)) {
    log(`ERRO: A chave ${key} ja existe no cesto ${targetBucket.id}.`);
    highlightBucket(targetBucket.id, true);
    return;
  }

  if (targetBucket.elements.length < targetBucket.capacity) {
    targetBucket.elements.push(key);
    targetBucket.elements.sort((a, b) => a - b);
    log(`Chave ${key} inserida no cesto ${targetBucket.id}.`);
    updateVisuals();
    highlightBucket(targetBucket.id);
  } else {
    log(`Cesto ${targetBucket.id} esta cheio. Dividindo...`);
    if (targetBucket.localDepth === directory.globalDepth) {
      log(
        `PL (${targetBucket.localDepth}) == PG (${directory.globalDepth}). Dobrando diretorio.`
      );
      directory.globalDepth++;
      const oldSize = directory.pointers.length;
      let newPointers = new Array(oldSize * 2);
      for (let i = 0; i < oldSize; i++) {
        newPointers[i] = directory.pointers[i];
        newPointers[i + oldSize] = directory.pointers[i];
      }
      directory.pointers = newPointers;
      log(`Diretorio dobrado. Nova PG: ${directory.globalDepth}.`);
      updateVisuals();
    }

    targetBucket.localDepth++;
    const newBucket = {
      id: nextBucketId++,
      localDepth: targetBucket.localDepth,
      elements: [],
      capacity: maxBucketCapacity,
    };
    buckets.push(newBucket);
    log(
      `Cesto dividido ${targetBucket.id} (Nova PL: ${targetBucket.localDepth}). Novo cesto criado ${newBucket.id} (PL: ${newBucket.localDepth}).`
    );

    const allElementsToRedistribute = [...targetBucket.elements, key];
    targetBucket.elements = [];

    for (let i = 0; i < directory.pointers.length; i++) {
      if (directory.pointers[i] === targetBucket.id) {
        if ((i >> (targetBucket.localDepth - 1)) & 1) {
          directory.pointers[i] = newBucket.id;
        }
      }
    }

    targetBucket.elements = [];
    newBucket.elements = [];

    for (const el of allElementsToRedistribute) {
      let currentDirIndex = getHash(el, directory.globalDepth);
      let currentBucketId = directory.pointers[currentDirIndex];
      let bucketToInsertInto = buckets.find((b) => b.id === currentBucketId);

      if (bucketToInsertInto.elements.length < bucketToInsertInto.capacity) {
        bucketToInsertInto.elements.push(el);
        bucketToInsertInto.elements.sort((a, b) => a - b);
      } else {
        log(
          `CRÍTICO: Durante a redistribuição, o Cesto ${bucketToInsertInto.id} ainda esta cheio com a chave ${el}. Necessária divisão recursiva (não totalmente implementada nesta versão simplificada).`
        );
      }
    }
    log(
      `Elementos redistribuidos entre o cesto ${targetBucket.id} e o cesto ${newBucket.id}.`
    );

    log(
      "Tentando novamente a inserção da chave original " +
        key +
        " após a divisão."
    );
    updateVisuals();

    let finalDirIndex = getHash(key, directory.globalDepth);
    let finalBucketId = directory.pointers[finalDirIndex];
    let finalTargetBucket = buckets.find((b) => b.id === finalBucketId);
    if (
      finalTargetBucket.elements.length >= finalTargetBucket.capacity &&
      !finalTargetBucket.elements.includes(key)
    ) {
      log(
        `AVISO: A chave ${key} ainda direciona para um cesto cheio ${finalBucketId}.`
      );
    } else if (
      !finalTargetBucket.elements.includes(key) &&
      finalTargetBucket.elements.length < finalTargetBucket.capacity
    ) {
    }

    updateVisuals();
    highlightBucket(newBucket.id);
    highlightBucket(targetBucket.id);
  }
  elementValueInput.value = "";
}

function searchElement() {
  const value = elementValueInput.value;
  if (value === "") {
    log("INFO: Valor do elemento para busca é vazio.");
    return;
  }
  const key = parseInt(value);
  if (isNaN(key)) {
    log("ERRO: Valor do elemento deve ser um numero inteiro.");
    return;
  }
  log(`Buscando pela chave: ${key}`);

  let dirIndex = getHash(key, directory.globalDepth);
  let bucketId = directory.pointers[dirIndex];
  let targetBucket = buckets.find((b) => b.id === bucketId);

  if (!targetBucket) {
    log(`ERRO CRÍTICO: Nenhum cesto encontrado para o ID ${bucketId} durante a busca.`);
    return;
  }

  highlightDirectoryEntry(dirIndex);
  highlightBucket(targetBucket.id);

  if (targetBucket.elements.includes(key)) {
    log(`Chave ${key} encontrada no cesto ${targetBucket.id}.`);
    highlightElementInBucket(targetBucket.id, key);
  } else {
    log(`Chave ${key} nao encontrada no cesto ${targetBucket.id}.`);
  }
}

function deleteElement() {
  const value = elementValueInput.value;
  if (value === "") {
    log("INFO: Valor do elemento para exclusão esta vazio.");
    return;
  }
  const key = parseInt(value);
  if (isNaN(key)) {
    log("ERRO: Valor do elemento deve ser um inteiro.");
    return;
  }
  log(`Tentando excluir a chave: ${key}`);

  let dirIndex = getHash(key, directory.globalDepth);
  let bucketId = directory.pointers[dirIndex];
  let targetBucket = buckets.find((b) => b.id === bucketId);

  if (!targetBucket) {
    log(
      `ERRO CRÍTICO: Nenhum cesto encontrado para o ID ${bucketId} durante a exclusão.`
    );
    return;
  }

  highlightDirectoryEntry(dirIndex);
  highlightBucket(targetBucket.id);

  const elementIndexInBucket = targetBucket.elements.indexOf(key);
  if (elementIndexInBucket > -1) {
    targetBucket.elements.splice(elementIndexInBucket, 1);
    log(`Chave ${key} deletada do cesto ${targetBucket.id}.`);
    updateVisuals();
    highlightBucket(targetBucket.id);
  } else {
    log(
      `Chave ${key} nao encontrada no cesto ${targetBucket.id}. Impossivel deletar.`
    );
  }
  elementValueInput.value = "";
}

function clearHighlights() {
  document
    .querySelectorAll(".highlight")
    .forEach((el) => el.classList.remove("highlight"));
  document
    .querySelectorAll(".highlight-strong")
    .forEach((el) => el.classList.remove("highlight-strong"));
}

function highlightDirectoryEntry(dirIndex, strong = false) {
  const entry = directoryEntriesDiv.children[dirIndex];
  if (entry) entry.classList.add(strong ? "highlight-strong" : "highlight");
}

function highlightBucket(bucketId, strong = false) {
  const bucketDiv = document.getElementById(`bucket-${bucketId}`);
  if (bucketDiv)
    bucketDiv.classList.add(strong ? "highlight-strong" : "highlight");
}

function highlightElementInBucket(bucketId, key) {
  highlightBucket(bucketId, true);
}

initBtn.addEventListener("click", () => {
  clearHighlights();
  initializeHashTable();
});
insertBtn.addEventListener("click", () => {
  clearHighlights();
  insertElement();
});
searchBtn.addEventListener("click", () => {
  clearHighlights();
  searchElement();
});
deleteBtn.addEventListener("click", () => {
  clearHighlights();
  deleteElement();
});

initializeHashTable();
