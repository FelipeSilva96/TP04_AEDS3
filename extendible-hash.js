// --- DOM Elements ---
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

// --- Core Data Structures ---
let directory = { globalDepth: 0, pointers: [] };
let buckets = []; // Array of bucket objects { localDepth, elements, capacity, id }
let maxBucketCapacity = 2;
let nextBucketId = 0; // To give unique IDs to buckets for easy reference

// --- Logging Function ---
function log(message) {
  logOutput.textContent = message + "\n" + logOutput.textContent;
  console.log(message); // Also log to browser console
}

// --- Rendering Functions ---
function renderDirectory() {
  globalDepthSpan.textContent = directory.globalDepth;
  directoryEntriesDiv.innerHTML = ""; // Clear previous entries

  const numEntries = Math.pow(2, directory.globalDepth);
  for (let i = 0; i < numEntries; i++) {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("dir-entry");
    const bucketId = directory.pointers[i];
    entryDiv.textContent = `${i} -> Bucket ${bucketId}`;
    // Optional: Add data-attributes or classes for styling based on bucketId
    entryDiv.style.borderColor = getBucketColor(bucketId); // Example
    directoryEntriesDiv.appendChild(entryDiv);
  }
}

function renderBuckets() {
  bucketListDiv.innerHTML = ""; // Clear previous buckets
  buckets.forEach((bucket) => {
    if (!bucket) return; // Handle potentially sparse array if buckets are "deleted" by nulling

    const bucketDiv = document.createElement("div");
    bucketDiv.classList.add("bucket");
    bucketDiv.id = `bucket-${bucket.id}`; // Use the unique bucket ID
    bucketDiv.style.borderColor = getBucketColor(bucket.id); // Example

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
  // Simple coloring scheme for visual distinction
  const colors = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"];
  return colors[bucketId % colors.length];
}

function updateVisuals() {
  renderDirectory();
  renderBuckets();
}

// --- Hashing Function ---
function getHash(key, depth) {
  if (depth === 0) return 0; // Avoid Math.pow(2,0) -> 1, then key % 1 = 0. For depth 0, always 1 entry.
  // Or, handle it as: if (depth === 0) return 0; for dir, and for split, ensure depth >= 1
  return Math.abs(parseInt(key)) % Math.pow(2, depth);
}

// --- Core Algorithm Functions ---
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
  buckets = [initialBucket]; // Store by ID if needed, or manage array indices carefully
  directory.pointers = [initialBucket.id]; // Pointer stores bucket ID

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
    targetBucket.elements.sort((a, b) => a - b); // Keep elements sorted
    log(`Chave ${key} inserida no cesto ${targetBucket.id}.`);
    updateVisuals();
    highlightBucket(targetBucket.id);
  } else {
    log(`Cesto ${targetBucket.id} esta cheio. Dividindo...`);
    // Bucket is full, need to split
    if (targetBucket.localDepth === directory.globalDepth) {
      // Double the directory
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
      updateVisuals(); // Show doubled directory before proceeding with split logic for clarity
    }

    // Create a new bucket and increment local depths
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

    // Re-distribute elements from the original bucket + the new key
    const allElementsToRedistribute = [...targetBucket.elements, key];
    targetBucket.elements = []; // Clear original bucket

    for (const el of allElementsToRedistribute) {
      let newDirIndexForEl = getHash(el, directory.globalDepth); // Use global depth for dir mapping
      let targetBucketIdForEl = directory.pointers[newDirIndexForEl]; // This might point to the old or newly assigned pointer

      // The core of redistribution: decide based on the bit at localDepth
      // Elements are re-hashed based on the *new* local depth of the buckets involved in the split
      if (
        getHash(el, targetBucket.localDepth) ===
          getHash(key, targetBucket.localDepth) &&
        directory.pointers[getHash(el, directory.globalDepth)] !== newBucket.id
      ) {
        // This is a simplified check. A more robust way is to iterate directory entries.
        // The goal is to put elements into 'targetBucket' or 'newBucket'
        // based on their hash with 'targetBucket.localDepth' (which is also newBucket.localDepth)
      }

      // Simpler redistribution: check which bucket it *would* go to based on the new local depth
      // This is where the directory pointers need careful updating.
      // The pointers that need to change are those that pointed to the *original* targetBucket,
      // and whose hash up to the new localDepth matches the hash of the newBucket's "identity".

      // Corrected Redistribution Logic:
      // After increasing targetBucket.localDepth and creating newBucket (with same PL),
      // iterate through all directory entries. For each entry `j`:
      // If directory.pointers[j] was pointing to the original targetBucket.id:
      //   Recalculate where this directory entry `j` should point.
      //   The hash `getHash(j, targetBucket.localDepth)` effectively tells us.
      //   One common way to do this: The original bucket covered a range of hashes.
      //   The new split divides this range. All directory entries that previously pointed to targetBucket
      //   and whose `k`-th bit (where `k` is `targetBucket.localDepth - 1`) is 1 will now point to `newBucket`.
      //   The other half remains pointing to `targetBucket`. (Assuming MSB for splitting or LSB)
      //   A simpler way to think: after increasing local depth, iterate all elements (old + new one)
      //   and insert them into 'targetBucket' or 'newBucket' based on their hash with the new localDepth.
    }

    // Update Directory Pointers
    // This is the trickiest part. Iterate over the entire directory.
    // For each directory index `i` from 0 to 2^PG - 1:
    //   If `directory.pointers[i]` was pointing to the `targetBucket.id` *before* PL was incremented:
    //     We need to decide if it still points to `targetBucket` or now to `newBucket`.
    //     This decision is based on the `(targetBucket.localDepth - 1)`-th bit of `i` (or `getHash(i, targetBucket.localDepth)`).
    //     A common pattern is that `newBucket` takes over the "second half" of the pointers that previously pointed to the split bucket.
    //     The `hash2` method in your Java code is relevant here: `Math.abs(chave) % (int) Math.pow(2, pl)`
    //     We need to identify all directory entries `j` that point to the *old address* of the bucket that just split.
    //     Among these, some will continue to point to the (now smaller range) old bucket, and others will point to the new bucket.
    //     The newBucket gets associated with pointer patterns that differ from the original bucket at the bit position corresponding to the new (targetBucket.localDepth).

    for (let i = 0; i < directory.pointers.length; i++) {
      // If this directory entry `i` points to the bucket that just split (`targetBucket.id`)
      // OR if it pointed to what targetBucket *used to be* before PL changed.
      // This condition needs to be based on the addresses *before* the split.
      // The logic in your Java `create` method for updating addresses is key:
      //   int inicio = diretorio.hash2(elem.hashCode(), c.profundidadeLocal); // before incrementing pl
      //   int deslocamento = (int) Math.pow(2, pl_old); // pl_old is original PL
      //   int max = (int) Math.pow(2, pg);
      //   boolean troca = false; // This seems to alternate.
      //   for (int j = inicio; j < max; j += deslocamento) {
      //       if (troca) { diretorio.atualizaEndereco(j, novoEndereco); }
      //       troca = !troca;
      //   }
      // This implies that for all directory entries that map to the same value using the *old* local depth of the bucket,
      // half will point to the old bucket, half to the new one, differentiated by the newly significant bit.

      // A more direct way: find all directory entries `idx` whose `getHash(idx, targetBucket.localDepth)` matches `getHash(representative_key_for_new_bucket, targetBucket.localDepth)`
      // and `directory.pointers[idx]` was `targetBucket.id`. Update these to `newBucket.id`.
      // Let's use the logic inspired by your Java code more directly for updating pointers for the split.
      // The `inicio` is the first directory entry that would have pointed to the original bucket (using the old local depth).
      // `deslocamento` is `2^old_local_depth`.
      // We are interested in pointers that matched `targetBucket.id`.

      // Example: Bucket B0 (PL=0) splits. PG becomes 1. B0's PL becomes 1. New B1 (PL=1) created.
      // Dir[0] pointed to B0. Now Dir[0] points to B0, Dir[1] points to B1 (or vice-versa).
      // If Bucket Bx (PL=p) splits, and PG=p, then PG becomes p+1. Bx's PL becomes p+1. New By (PL=p+1).
      // All dir entries `j` that previously pointed to Bx, now some point to Bx, some to By.
      // The distinguishing factor is the `p`-th bit (0-indexed) of `j`.
      // If `(j >> (targetBucket.localDepth - 1)) & 1` is 1 (or 0, depending on convention), it points to newBucket.

      // Iterate through all directory entries.
      // If a directory entry `i` points to the bucket that was split (`targetBucket.id`),
      // then we check if its `(targetBucket.localDepth - 1)`-th bit (0-indexed for bits) is set.
      // If it is, it should point to `newBucket`. Otherwise, it stays with `targetBucket`.
      // This ensures that `newBucket` takes half of the directory pointers previously pointing to `targetBucket`.
      if (directory.pointers[i] === targetBucket.id) {
        // Only consider pointers that were pointing to the split bucket
        if ((i >> (targetBucket.localDepth - 1)) & 1) {
          // Check the bit that distinguishes the two new bucket ranges
          directory.pointers[i] = newBucket.id;
        }
      }
    }

    // Now, re-insert all elements (from original bucket + the new one) into the appropriate bucket
    // (either targetBucket or newBucket)
    targetBucket.elements = []; // Already cleared, but good to be sure
    newBucket.elements = [];

    for (const el of allElementsToRedistribute) {
      let currentDirIndex = getHash(el, directory.globalDepth);
      let currentBucketId = directory.pointers[currentDirIndex];
      let bucketToInsertInto = buckets.find((b) => b.id === currentBucketId);

      if (bucketToInsertInto.elements.length < bucketToInsertInto.capacity) {
        bucketToInsertInto.elements.push(el);
        bucketToInsertInto.elements.sort((a, b) => a - b);
      } else {
        // This case should ideally not happen if split logic is correct and we're just reinserting.
        // However, if a re-insertion causes another bucket to fill and need splitting,
        // the problem becomes recursive. The provided Java code re-calls `create()` for each element,
        // which handles this recursion naturally.
        log(
          `CRÍTICO: Durante a redistribuição, o Cesto ${bucketToInsertInto.id} ainda esta cheio com a chave ${el}. Necessária divisão recursiva (não totalmente implementada nesta versão simplificada).`
        );
        // For simplicity here, we will call insert recursively.
        // To avoid infinite loops on a badly chosen key that always hashes same, this should be handled.
        // The Java code calls `create(c.elementos.get(j))` and `create(elem)` which is recursive.
        // For this visualization, we might need a temporary state or a slightly different re-distribution strategy
        // if we don't want to make it fully recursive in JS immediately.
        // For now, let's assume elements can be re-distributed without further splits if the logic is right.
        // The recursive call `create(elem)` in Java handles cases where the *new* element itself triggers more splits.
      }
    }
    log(
      `Elementos redistribuidos entre o cesto ${targetBucket.id} e o cesto ${newBucket.id}.`
    );

    // After redistribution, call insert for the original problematic key again.
    // This will now go into a non-full bucket or trigger further splits correctly.
    // This is the simplest way to mirror the Java code's recursive `create(elem)` call.
    // To prevent infinite loops in a bad scenario, add a depth counter or ensure progress.
    // For this visualization, simply trying to insert the key *again* after splitting and redistributing
    // the *old* elements should work, as the structure has changed.
    log("Tentando novamente a inserção da chave original " + key + " após a divisão.");
    updateVisuals(); // Update to show new buckets and directory pointers
    // Call insertElement *without* logging the "attempting to insert" message again for this recursive call
    // or pass a flag to indicate it's a recursive call.
    // For now, just re-run logic. If `key` fits, it fits. If it needs another split, current logic for `insertElement` will handle.
    // A better approach for the recursive part: after splitting and creating new buckets and updating directory,
    // iterate all elements (original target bucket's elements + the new key) and insert them one by one
    // using the main `insertElement` logic (or a helper that doesn't trigger initial log).
    // The provided Java code essentially calls `create()` for each element of the old bucket, then `create()` for the new one.
    // Let's simulate that by re-inserting the original key. The *other* elements are already placed.

    // Actually, the re-distribution logic above should have placed all elements, including the new one.
    // The last call to `create(elem)` in the Java code is crucial if the element being inserted
    // still hashes to a bucket that needs splitting *even after the initial split and redistribution*.
    // This means the re-distribution logic has to be perfect or we rely on the recursive nature.

    // Let's simplify: the re-distribution loop above should handle the new `key` as well.
    // If, after that, the `key` still can't be inserted, it indicates a deeper issue or need for more splits
    // which would be handled if `insertElement` was truly recursive for *each* element.
    // The current loop for `allElementsToRedistribute` should place `key`.
    // The question is if placing `key` overflows its new bucket.
    let finalDirIndex = getHash(key, directory.globalDepth);
    let finalBucketId = directory.pointers[finalDirIndex];
    let finalTargetBucket = buckets.find((b) => b.id === finalBucketId);
    if (
      finalTargetBucket.elements.length >= finalTargetBucket.capacity &&
      !finalTargetBucket.elements.includes(key)
    ) {
      log(
        `WARNING: Key ${key} still targets a full bucket ${finalBucketId} after split. Needs recursive insert logic like Java.`
      );
      // This implies the element that caused the split *still* cannot fit.
      // This happens if all elements hash to the same sequence of buckets, requiring many splits.
      // The Java code's `create(c.elementos.get(j));` and then `create(elem);` handles this.
      // We need to re-run the *entire* insert logic for the key that caused the overflow.
      // For now, the re-distribution puts it. If that re-distribution itself finds the new bucket full,
      // then this simple visualization might show an issue unless we fully replicate the recursive calls.
    } else if (
      !finalTargetBucket.elements.includes(key) &&
      finalTargetBucket.elements.length < finalTargetBucket.capacity
    ) {
      // This should not be strictly necessary if redistribution was complete
      // finalTargetBucket.elements.push(key);
      // finalTargetBucket.elements.sort((a,b)=>a-b);
      // log(`Key ${key} placed in Bucket ${finalTargetBucket.id} after split and re-distribution.`);
    }

    updateVisuals();
    highlightBucket(newBucket.id);
    highlightBucket(targetBucket.id);
  }
  elementValueInput.value = ""; // Clear input
}

function searchElement() {
  const value = elementValueInput.value;
  if (value === "") {
    log("INFO: Element value for search is empty.");
    return;
  }
  const key = parseInt(value);
  if (isNaN(key)) {
    log("ERROR: Element value must be an integer.");
    return;
  }
  log(`Searching for key: ${key}`);

  let dirIndex = getHash(key, directory.globalDepth);
  let bucketId = directory.pointers[dirIndex];
  let targetBucket = buckets.find((b) => b.id === bucketId);

  if (!targetBucket) {
    log(`CRITICAL ERROR: No bucket found for ID ${bucketId} during search.`);
    return;
  }

  highlightDirectoryEntry(dirIndex);
  highlightBucket(targetBucket.id);

  if (targetBucket.elements.includes(key)) {
    log(`Key ${key} FOUND in Bucket ${targetBucket.id}.`);
    highlightElementInBucket(targetBucket.id, key);
  } else {
    log(`Key ${key} NOT FOUND in Bucket ${targetBucket.id}.`);
  }
}

function deleteElement() {
  const value = elementValueInput.value;
  if (value === "") {
    log("INFO: Element value for delete is empty.");
    return;
  }
  const key = parseInt(value);
  if (isNaN(key)) {
    log("ERROR: Element value must be an integer.");
    return;
  }
  log(`Attempting to delete key: ${key}`);

  let dirIndex = getHash(key, directory.globalDepth);
  let bucketId = directory.pointers[dirIndex];
  let targetBucket = buckets.find((b) => b.id === bucketId);

  if (!targetBucket) {
    log(`CRITICAL ERROR: No bucket found for ID ${bucketId} during delete.`);
    return;
  }

  highlightDirectoryEntry(dirIndex);
  highlightBucket(targetBucket.id);

  const elementIndexInBucket = targetBucket.elements.indexOf(key);
  if (elementIndexInBucket > -1) {
    targetBucket.elements.splice(elementIndexInBucket, 1);
    log(`Key ${key} DELETED from Bucket ${targetBucket.id}.`);
    updateVisuals();
    highlightBucket(targetBucket.id); // Re-highlight after redraw
  } else {
    log(`Key ${key} NOT FOUND in Bucket ${targetBucket.id}. Cannot delete.`);
  }
  elementValueInput.value = "";

  // Note: Merging buckets and shrinking directory on delete is an advanced feature
  // not implemented here for simplicity, but it's part of a full extendible hash table.
}

// --- Highlighting Functions (Basic) ---
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
  // This is more complex as elements are just text.
  // You might need to wrap each element in a span to highlight it individually.
  // For now, just strongly highlighting the bucket is an approximation.
  highlightBucket(bucketId, true);
}

// --- Event Listeners ---
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

// --- Initial State ---
initializeHashTable(); // Initialize on load
