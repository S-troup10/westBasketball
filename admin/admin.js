// Admin panel logic for editing club site data in-place

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const byteArray = Array.from(new Uint8Array(hashBuffer));
  return byteArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ADMIN_SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

function isAdminSessionValid() {
  const expires = parseInt(localStorage.getItem("adminAccessExpires") || "0", 10);
  return (
    expires > Date.now() &&
    localStorage.getItem("adminAccess") === "granted" &&
    isTokenValid()
  );
}

function isTokenValid() {
  const expires = parseInt(localStorage.getItem("adminApiTokenExpires") || "0", 10);
  return expires > Date.now() && !!localStorage.getItem("adminApiToken");
}

function grantAdminSession(password) {
  const expires = Date.now() + ADMIN_SESSION_TTL_MS;
  localStorage.setItem("adminAccess", "granted");
  localStorage.setItem("adminAccessExpires", expires.toString());
}

async function checkAdminPassword() {
  // Skip if already validated and not expired
  if (localStorage.getItem("adminAccess") === "granted" && isAdminSessionValid()) return;
  // If modal lock is present, let it handle gating
  if (document.getElementById("password-modal")) return;
  // If no modal and no valid session, send away
  window.location.href = "../index.html";
}

function getApiBase() {
  return typeof API_BASE !== "undefined" ? API_BASE : "";
}

async function ensureApiToken() {
  const cached = localStorage.getItem("adminApiToken");
  if (cached && isTokenValid()) return cached;
  throw new Error("Login required");
}

// Image upload handling - converts to base64 for localStorage storage
function handleImageUpload(input, imageKey, previewId, placeholderId) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const preview = document.getElementById(previewId);
    const placeholder = document.getElementById(placeholderId);
    
    if (preview) {
      preview.src = base64;
      preview.classList.remove('hidden');
    }
    if (placeholder) {
      placeholder.classList.add('hidden');
    }
    
    // Store in pending images to be saved
    if (!window.pendingImages) window.pendingImages = {};
    window.pendingImages[imageKey] = base64;
  };
  reader.readAsDataURL(file);
}

// Gallery photo upload handling
function handleGalleryImageUpload(input, previewId, srcInputId) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const preview = document.getElementById(previewId);
    const srcInput = document.getElementById(srcInputId);
    
    if (preview) {
      preview.src = base64;
      preview.classList.remove('hidden');
      preview.parentElement.querySelector('.upload-placeholder')?.classList.add('hidden');
    }
    if (srcInput) {
      srcInput.value = base64;
    }
  };
  reader.readAsDataURL(file);
}

function initCustomDropdowns(root = document) {
  const dropdowns = root.querySelectorAll("[data-dropdown]");
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector("[data-dropdown-trigger]");
    const menu = dropdown.querySelector("[data-dropdown-menu]");
    const input = dropdown.querySelector("[data-dropdown-input]");
    const label = dropdown.querySelector("[data-dropdown-label]");
    const options = menu ? Array.from(menu.querySelectorAll("[data-dropdown-option]")) : [];
    if (!trigger || !menu || !input || !label || !options.length) return;

    const syncLabel = () => {
      const current = input.value || options[0]?.dataset.value || "";
      const active = options.find((opt) => opt.dataset.value === current);
      label.textContent = (active ? active.textContent : current || options[0]?.textContent || "").trim();
      options.forEach((opt) => {
        opt.classList.toggle("bg-white/10", opt.dataset.value === current);
        opt.classList.toggle("text-white", opt.dataset.value === current);
      });
    };

    syncLabel();
    if (dropdown.dataset.dropdownReady === "true") return;

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.classList.toggle("hidden");
    });

    options.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        input.value = option.dataset.value || option.textContent.trim();
        syncLabel();
        menu.classList.add("hidden");
      });
    });

    dropdown.dataset.dropdownReady = "true";
  });

  if (!window.customDropdownBound) {
    window.customDropdownBound = true;
    document.addEventListener("click", (event) => {
      document.querySelectorAll("[data-dropdown-menu]").forEach((menu) => {
        if (!menu.closest("[data-dropdown]")?.contains(event.target)) {
          menu.classList.add("hidden");
        }
      });
    });
  }
}

function getNextGalleryIndex(container) {
  const indices = Array.from(container.querySelectorAll("[data-index]"))
    .map((card) => parseInt(card.dataset.index, 10))
    .filter(Number.isFinite);
  return indices.length ? Math.max(...indices) + 1 : 0;
}

function createGalleryCard(item, idx) {
  const card = document.createElement("div");
  card.className = "mb-4 rounded-2xl border border-white/10 bg-white/5 p-5";
  card.dataset.index = idx;
  
  const previewId = `gallery-preview-${idx}`;
  const srcInputId = `gallery-src-${idx}`;
  const fileInputId = `gallery-file-${idx}`;
  
  card.innerHTML = `
    <div class="grid md:grid-cols-3 gap-4">
      <div class="space-y-2">
        <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Photo</label>
        <div class="image-upload-area border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-primary/50 transition-colors cursor-pointer h-32 flex items-center justify-center" onclick="document.getElementById('${fileInputId}').click()">
          <img id="${previewId}" src="${item.src || ''}" alt="Preview" class="${item.src ? '' : 'hidden'} w-full h-full object-cover rounded-lg" />
          <div class="upload-placeholder ${item.src ? 'hidden' : ''} space-y-1">
            <svg class="w-6 h-6 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p class="text-xs text-white/40">Upload</p>
          </div>
          <input type="file" id="${fileInputId}" accept="image/*" class="hidden" onchange="handleGalleryImageUpload(this, '${previewId}', '${srcInputId}')" />
          <input type="hidden" id="${srcInputId}" name="gallery-src-${idx}" value="${item.src || ''}" />
        </div>
      </div>
      <div class="md:col-span-2 space-y-3">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Caption</label>
          <input name="gallery-caption-${idx}" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" value="${item.caption || ''}" placeholder="Photo caption" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Category</label>
          <div class="relative" data-dropdown>
            <button type="button" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white flex items-center justify-between focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" data-dropdown-trigger>
              <span data-dropdown-label></span>
              <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="hidden absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-dark/95 shadow-xl overflow-hidden" data-dropdown-menu>
              <button type="button" class="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10" data-dropdown-option data-value="Teams">Teams</button>
              <button type="button" class="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10" data-dropdown-option data-value="Events">Events</button>
              <button type="button" class="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10" data-dropdown-option data-value="Training">Training</button>
            </div>
            <input type="hidden" name="gallery-category-${idx}" value="${item.category || 'Teams'}" data-dropdown-input />
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="mt-3 text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded-lg px-3 py-1.5 transition-all" onclick="this.closest('[data-index]').remove()">
      <span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Remove</span>
    </button>
  `;

  return card;
}

function buildGalleryEditor(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  items.forEach((item, idx) => {
    const card = createGalleryCard(item, idx);
    container.appendChild(card);
    initCustomDropdowns(card);
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className =
    "mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/30 px-4 py-2.5 text-sm text-primary hover:border-primary hover:bg-primary/10 transition-all";
  addBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add Photo`;
  addBtn.dataset.galleryAdd = "true";
  addBtn.onclick = () => {
    const card = createGalleryCard({}, getNextGalleryIndex(container));
    container.insertBefore(card, addBtn);
    initCustomDropdowns(card);
  };
  container.appendChild(addBtn);
}

function collectGalleryList() {
  const container = document.getElementById('gallery-list');
  if (!container) return [];
  const cards = Array.from(container.querySelectorAll("[data-index]"));
  return cards.map((card, idx) => {
    const srcInput = card.querySelector(`[name="gallery-src-${card.dataset.index}"]`) || card.querySelector(`[id^="gallery-src-"]`);
    const captionInput = card.querySelector(`[name^="gallery-caption-"]`);
    const categorySelect = card.querySelector(`[name^="gallery-category-"]`);
    return {
      src: srcInput ? srcInput.value.trim() : '',
      caption: captionInput ? captionInput.value.trim() : '',
      category: categorySelect ? categorySelect.value : 'Teams'
    };
  }).filter(item => item.src);
}

function handleGalleryBulkUpload(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  const container = document.getElementById("gallery-list");
  if (!container) return;
  const addBtn = container.querySelector("[data-gallery-add]");
  let nextIndex = getNextGalleryIndex(container);

  files.forEach((file) => {
    const baseName = (file.name || "").replace(/\.[^/.]+$/, "");
    const card = createGalleryCard({ caption: baseName, category: "Teams" }, nextIndex++);
    if (addBtn) {
      container.insertBefore(card, addBtn);
    } else {
      container.appendChild(card);
    }
    initCustomDropdowns(card);

    const preview = card.querySelector("img[id^='gallery-preview-']");
    const srcInput = card.querySelector("input[id^='gallery-src-']");
    const placeholder = card.querySelector(".upload-placeholder");
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result;
      if (preview) {
        preview.src = base64;
        preview.classList.remove("hidden");
      }
      if (placeholder) {
        placeholder.classList.add("hidden");
      }
      if (srcInput) {
        srcInput.value = base64;
      }
    };
    reader.readAsDataURL(file);
  });
}

function buildSimplePhotoEditor(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  (photos || []).forEach((src, idx) => {
    container.appendChild(createCard(src, idx));
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className =
    "mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/30 px-4 py-2.5 text-sm text-primary hover:border-primary hover:bg-primary/10 transition-all";
  addBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add photo`;
  addBtn.onclick = () => {
    const card = createCard("", container.querySelectorAll("[data-index]").length);
    container.insertBefore(card, addBtn);
  };
  container.appendChild(addBtn);

  function createCard(src, idx) {
    const card = document.createElement("div");
    card.className = "mb-3 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4";
    card.dataset.index = idx;
    const previewId = `${containerId}-preview-${idx}`;
    const fileId = `${containerId}-file-${idx}`;
    const srcInputId = `${containerId}-src-${idx}`;
    card.innerHTML = `
      <div class="flex items-center gap-3 w-full">
        <div class="image-upload-area border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-primary/50 transition-colors cursor-pointer w-32 h-24 flex items-center justify-center" onclick="document.getElementById('${fileId}').click()">
          <img id="${previewId}" src="${src || ''}" alt="Preview" class="${src ? '' : 'hidden'} w-full h-full object-cover rounded-lg" />
          <div class="upload-placeholder ${src ? 'hidden' : ''} space-y-1">
            <svg class="w-6 h-6 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p class="text-xs text-white/40">Upload</p>
          </div>
          <input type="file" id="${fileId}" accept="image/*" class="hidden" onchange="handleGalleryImageUpload(this, '${previewId}', '${srcInputId}')" />
          <input type="hidden" id="${srcInputId}" value="${src || ''}" />
        </div>
        <button type="button" class="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded-lg px-3 py-1.5 transition-all h-fit" onclick="this.closest('[data-index]').remove()">
          Remove
        </button>
      </div>
    `;
    return card;
  }
}

function collectSimplePhotoList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const cards = Array.from(container.querySelectorAll("[data-index]"));
  return cards
    .map((card) => {
      const srcInput = card.querySelector("input[type='hidden']");
      return srcInput ? srcInput.value.trim() : "";
    })
    .filter(Boolean);
}

function buildFeaturedPhotosEditor(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  (items || []).forEach((item, idx) => {
    container.appendChild(createCard(item, idx));
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className =
    "mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/30 px-4 py-2.5 text-sm text-primary hover:border-primary hover:bg-primary/10 transition-all";
  addBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add featured photo`;
  addBtn.onclick = () => {
    const card = createCard({}, container.querySelectorAll("[data-index]").length);
    container.insertBefore(card, addBtn);
  };
  container.appendChild(addBtn);

  function createCard(item, idx) {
    const card = document.createElement("div");
    card.className = "mb-3 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3";
    card.dataset.index = idx;
    const previewId = `${containerId}-preview-${idx}`;
    const srcInputId = `${containerId}-src-${idx}`;
    const fileId = `${containerId}-file-${idx}`;
    card.innerHTML = `
      <div class="grid md:grid-cols-3 gap-3 items-start">
        <div>
          <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Photo</label>
          <div class="image-upload-area border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-primary/50 transition-colors cursor-pointer h-28 flex items-center justify-center" onclick="document.getElementById('${fileId}').click()">
            <img id="${previewId}" src="${item.src || ""}" alt="Preview" class="${item.src ? "" : "hidden"} w-full h-full object-cover rounded-lg" />
            <div class="upload-placeholder ${item.src ? "hidden" : ""} space-y-1">
              <svg class="w-6 h-6 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p class="text-xs text-white/40">Upload</p>
            </div>
            <input type="file" id="${fileId}" accept="image/*" class="hidden" onchange="handleGalleryImageUpload(this, '${previewId}', '${srcInputId}')" />
            <input type="hidden" id="${srcInputId}" value="${item.src || ''}" />
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Title</label>
            <input name="featured-title-${idx}" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" value="${item.title || ''}" placeholder="Caption" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Subtitle</label>
            <input name="featured-subtitle-${idx}" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" value="${item.subtitle || ''}" placeholder="Sub caption" />
          </div>
        </div>
      </div>
      <button type="button" class="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded-lg px-3 py-1.5 transition-all" onclick="this.closest('[data-index]').remove()">
        Remove
      </button>
    `;
    return card;
  }
}

function collectFeaturedPhotos(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const cards = Array.from(container.querySelectorAll("[data-index]"));
  return cards
    .map((card) => {
      const srcInput = card.querySelector("input[type='hidden']");
      const titleInput = card.querySelector("[name^='featured-title']");
      const subtitleInput = card.querySelector("[name^='featured-subtitle']");
      return {
        src: srcInput ? srcInput.value.trim() : "",
        title: titleInput ? titleInput.value.trim() : "",
        subtitle: subtitleInput ? subtitleInput.value.trim() : ""
      };
    })
    .filter((item) => item.src);
}

function formatLinksText(links) {
  return (links || [])
    .map((link) => {
      if (!link || (!link.label && !link.href)) return "";
      return `${link.label || ""} | ${link.href || ""}`.trim();
    })
    .filter(Boolean)
    .join("\n");
}

function parseLinksText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return { label: label || href || "", href: href || "" };
    })
    .filter((link) => link.label || link.href);
}

function parseLines(text) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildListEditor(containerId, items, fields) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  items.forEach((item, idx) => {
    container.appendChild(createCard(item, idx));
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className =
    "mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/30 px-4 py-2.5 text-sm text-primary hover:border-primary hover:bg-primary/10 transition-all";
  addBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add another`;
  addBtn.onclick = () => {
    const card = createCard({}, container.children.length);
    container.insertBefore(card, addBtn);
  };
  container.appendChild(addBtn);

  function createCard(item, idx) {
    const card = document.createElement("div");
    card.className = "mb-3 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4";
    card.dataset.index = idx;

    fields.forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = "space-y-1.5";
      const label = document.createElement("label");
      label.className = "text-xs font-medium text-white/50 uppercase tracking-wider";
      label.textContent = field.label;
      const input = field.multiline
        ? document.createElement("textarea")
        : document.createElement("input");
      input.name = `${containerId}-${field.name}-${idx}`;
      input.className =
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";
      if (field.multiline) input.rows = 3;
      input.value = item[field.name] ?? "";
      wrapper.append(label, input);
      card.appendChild(wrapper);
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded-lg px-3 py-1.5 transition-all";
    removeBtn.innerHTML = `<span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Remove</span>`;
    removeBtn.onclick = () => card.remove();
    card.appendChild(removeBtn);

    return card;
  }
}

function collectList(containerId, fields) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const cards = Array.from(container.querySelectorAll("[data-index]"));
  return cards.map((card) => {
    const item = {};
    fields.forEach((field) => {
      const input = card.querySelector(`[name^="${containerId}-${field.name}"]`);
      item[field.name] = input ? input.value.trim() : "";
    });
    return item;
  });
}

function buildSponsorsEditor(containerId, sponsors) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  (sponsors || []).forEach((sponsor, idx) => {
    container.appendChild(createCard(sponsor, idx));
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className =
    "mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/30 px-4 py-2.5 text-sm text-primary hover:border-primary hover:bg-primary/10 transition-all";
  addBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add sponsor`;
  addBtn.onclick = () => {
    const card = createCard({}, container.querySelectorAll("[data-index]").length);
    container.insertBefore(card, addBtn);
  };
  container.appendChild(addBtn);

  function createCard(sponsor, idx) {
    const card = document.createElement("div");
    card.className = "mb-3 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3";
    card.dataset.index = idx;
    const previewId = `${containerId}-logo-preview-${idx}`;
    const fileId = `${containerId}-logo-file-${idx}`;
    const srcInputId = `${containerId}-logo-src-${idx}`;
    const nameId = `${containerId}-name-${idx}`;
    const urlId = `${containerId}-url-${idx}`;

    card.innerHTML = `
      <div class="grid md:grid-cols-3 gap-4 items-start">
        <div>
          <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Logo</label>
          <div class="image-upload-area border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-primary/50 transition-colors cursor-pointer h-28 flex items-center justify-center" onclick="document.getElementById('${fileId}').click()">
            <img id="${previewId}" src="${sponsor.logo || ""}" alt="Logo preview" class="${sponsor.logo ? "" : "hidden"} w-full h-full object-contain rounded-lg bg-white/5" />
            <div class="upload-placeholder ${sponsor.logo ? "hidden" : ""} space-y-1">
              <svg class="w-6 h-6 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p class="text-xs text-white/40">Upload logo</p>
            </div>
            <input type="file" id="${fileId}" accept="image/*" class="hidden" onchange="handleGalleryImageUpload(this, '${previewId}', '${srcInputId}')" />
            <input type="hidden" id="${srcInputId}" value="${sponsor.logo || ""}" />
          </div>
        </div>
        <div class="md:col-span-2 space-y-3">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-white/50 uppercase tracking-wider" for="${nameId}">Name</label>
            <input id="${nameId}" name="${containerId}-name-${idx}" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" value="${sponsor.name || ""}" placeholder="Sponsor name" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-white/50 uppercase tracking-wider" for="${urlId}">Website (optional)</label>
            <input id="${urlId}" name="${containerId}-url-${idx}" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" value="${sponsor.url || ""}" placeholder="https://sponsor-site.com" />
          </div>
        </div>
      </div>
      <button type="button" class="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/50 rounded-lg px-3 py-1.5 transition-all" onclick="this.closest('[data-index]').remove()">
        Remove
      </button>
    `;

    return card;
  }
}

function collectSponsors(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const cards = Array.from(container.querySelectorAll("[data-index]"));
  return cards
    .map((card) => {
      const name = card.querySelector(`[name^="${containerId}-name"]`)?.value.trim() || "";
      const url = card.querySelector(`[name^="${containerId}-url"]`)?.value.trim() || "";
      const logo = card.querySelector(`input[id*="${containerId}-logo-src"]`)?.value.trim() || "";
      return { name, url, logo };
    })
    .filter((item) => item.name || item.logo || item.url);
}

function hydrateAdminForms() {
  const data = window.siteContent;
  data.about = data.about || {};
  const pages = data.pages || {};
  const home = pages.home || {};
  const aboutPage = pages.about || {};
  const joinPage = pages.join || {};
  const merchPage = pages.merch || {};
  const coachesPage = pages.coaches || {};
  const sponsorsPage = pages.sponsors || {};
  const galleryPage = pages.gallery || {};

  // Hero
  setValue("hero-headline", data.hero.headline);
  setValue("hero-subhead", data.hero.subhead);
  setValue("hero-primary-label", data.hero.primaryCta.label);
  setValue("hero-primary-href", data.hero.primaryCta.href);
  setValue("hero-secondary-label", data.hero.secondaryCta.label);
  setValue("hero-secondary-href", data.hero.secondaryCta.href);

  setValue("club-tagline", data.club.tagline);
  setValue("club-intro", data.club.homeIntro);

  buildListEditor("nav-links-list", data.navigation?.links || [], [
    { name: "label", label: "Label" },
    { name: "href", label: "URL" },
    { name: "key", label: "Key" }
  ]);
  setValue("nav-admin-label-field", data.navigation?.adminLabel);

  buildListEditor("footer-links-list", data.footer?.quickLinks || [], [
    { name: "label", label: "Label" },
    { name: "href", label: "URL" }
  ]);
  buildListEditor("footer-connect-list", data.footer?.connectLinks || [], [
    { name: "label", label: "Label" },
    { name: "href", label: "URL" }
  ]);
  setValue("footer-tagline-field", data.footer?.tagline);
  setValue("footer-note-field", data.footer?.note);
  setValue("footer-quick-title-field", data.footer?.quickLinksTitle);
  setValue("footer-connect-title-field", data.footer?.connectTitle);

  // Homepage copy
  setValue("home-hero-kicker-field", home.heroKicker);
  setValue("home-hero-title-field", home.heroTitle || data.hero.headline);
  setValue("home-hero-highlight-field", home.heroHighlight);
  setValue("home-programs-tag-field", home.programsTag);
  setValue("home-programs-title-field", home.programsTitle);
  setValue("home-story-tag-field", home.storyTag);
  setValue("home-story-title-field", home.storyTitle);
  setValue("home-story-subtitle-field", home.storySubtitle);
  setValue("home-gallery-tag-field", home.galleryTag);
  setValue("home-gallery-title-field", home.galleryTitle);
  setValue("home-gallery-subtitle-field", home.gallerySubtitle);
  setValue("home-news-tag-field", home.newsTag);
  setValue("home-news-title-field", home.newsTitle);
  setValue("home-links-tag-field", home.linksTag);
  setValue("home-links-title-field", home.linksTitle);
  setValue("home-links-card-title-field", home.linksCardTitle);
  setValue("home-links-card-text-field", home.linksCardText);
  setValue("home-sponsors-tag-field", home.sponsorsTag);
  setValue("home-sponsors-title-field", home.sponsorsTitle);
  setValue("home-sponsors-desc-field", home.sponsorsDescription);
  setValue("home-sponsors-cta-label", home.sponsorsCtaLabel);
  setValue("home-sponsors-cta-href", home.sponsorsCtaHref);
  setValue("home-cta-tag-field", home.ctaTag);
  setValue("home-cta-title-field", home.ctaTitle);
  setValue("home-cta-highlight-field", home.ctaHighlight);
  setValue("home-cta-description-field", home.ctaDescription);
  setValue("home-cta-primary-label-field", home.ctaPrimary?.label);
  setValue("home-cta-primary-href-field", home.ctaPrimary?.href);
  setValue("home-cta-secondary-label-field", home.ctaSecondary?.label);
  setValue("home-cta-secondary-href-field", home.ctaSecondary?.href);
  setValue("home-quote-text-field", home.quote?.text);
  setValue("home-quote-attrib-field", home.quote?.attribution);

  buildListEditor("home-programs-list", home.programs || [], [
    { name: "title", label: "Title" },
    { name: "badge", label: "Badge" },
    { name: "description", label: "Description", multiline: true },
    { name: "ctaLabel", label: "CTA label" },
    { name: "ctaHref", label: "CTA link" }
  ]);
  buildFeaturedPhotosEditor("home-featured-photos", home.featuredPhotos || []);

  const storyBlocks = (home.storyBlocks || []).map((block) => ({
    ...block,
    bulletsText: (block.bullets || []).join("\n")
  }));
  buildListEditor("home-story-list", storyBlocks, [
    { name: "tag", label: "Tag" },
    { name: "title", label: "Title" },
    { name: "summary", label: "Summary", multiline: true },
    { name: "bulletsText", label: "Bullets (one per line)", multiline: true }
  ]);

  buildListEditor("news-list", data.news, [
    { name: "title", label: "Title" },
    { name: "date", label: "Date" },
    { name: "summary", label: "Summary", multiline: true },
    { name: "url", label: "Link" }
  ]);

  buildListEditor("quick-links-list", data.quickLinks, [
    { name: "label", label: "Label" },
    { name: "href", label: "URL" }
  ]);

  buildSponsorsEditor("sponsor-list", data.sponsors);

  buildGalleryEditor("gallery-list", data.gallery || []);

  // Load site images previews
  const heroImg = data.images?.heroBackground;
  const logoImg = data.images?.logo;
  if (heroImg) {
    const heroPreview = document.getElementById('hero-image-preview');
    const heroPlaceholder = document.getElementById('hero-image-placeholder');
    if (heroPreview) {
      heroPreview.src = heroImg;
      heroPreview.classList.remove('hidden');
    }
    if (heroPlaceholder) heroPlaceholder.classList.add('hidden');
  }
  if (logoImg) {
    const logoPreview = document.getElementById('logo-image-preview');
    const logoPlaceholder = document.getElementById('logo-image-placeholder');
    if (logoPreview) {
      logoPreview.src = logoImg;
      logoPreview.classList.remove('hidden');
    }
    if (logoPlaceholder) logoPlaceholder.classList.add('hidden');
  }

  // About
  setValue("about-hero-tag-field", aboutPage.heroTag);
  setValue("about-hero-title-field", aboutPage.heroTitle);
  setValue("about-hero-highlight-field", aboutPage.heroHighlight);
  setValue("about-history-title-field", aboutPage.historyTitle);
  setValue("about-values-title-field", aboutPage.valuesTitle);
  setValue("about-life-title-field", aboutPage.lifeMembersTitle);
  setValue("about-intro-field", data.about.intro);
  setValue("about-history-field", data.about.history);
  setValue("about-values-field", (data.about.values || []).join("\n"));
  setValue("about-members-field", (data.about.lifeMembers || []).join("\n"));
  setValue("about-life-desc-field", aboutPage.lifeDescription);
  setValue("about-contact-tag-field", aboutPage.contactTag);
  setValue("about-contact-title-field", aboutPage.contactTitle);
  setValue("about-contact-highlight-field", aboutPage.contactHighlight);
  setValue("about-contact-cta-label", aboutPage.contactCtaLabel);
  setValue("about-contact-cta-href", aboutPage.contactCtaHref);
  setValue("about-contact-desc-field", aboutPage.contactDescription);
  setValue("about-extra-tag-field", aboutPage.extraTag);
  setValue("about-extra-title-field", aboutPage.extraTitle);
  setValue("about-extra-text-field", aboutPage.extraText);
  setValue("about-snapshot-title-field", data.about.snapshotTitle);
  setValue("about-snapshot-subtitle-field", data.about.snapshotSubtitle);
  buildListEditor("about-snapshot-stats-list", data.about.snapshotStats || [], [
    { name: "value", label: "Number" },
    { name: "label", label: "Label" },
    { name: "detail", label: "Detail", multiline: true }
  ]);
  setValue("about-pillars-title-field", data.about.pillarsTitle);
  setValue("about-pillars-subtitle-field", data.about.pillarsSubtitle);
  buildListEditor("about-pillars-list", data.about.pillars || [], [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", multiline: true }
  ]);
  setValue("about-initiatives-title-field", data.about.initiativesTitle);
  setValue("about-initiatives-subtitle-field", data.about.initiativesSubtitle);
  buildListEditor("about-initiatives-list", data.about.initiatives || [], [
    { name: "title", label: "Title" },
    { name: "tag", label: "Tag" },
    { name: "description", label: "Description", multiline: true }
  ]);
  buildSimplePhotoEditor("about-photos-list", data.about.photos || []);

  // Join
  setValue("join-hero-tag-field", joinPage.heroTag);
  setValue("join-hero-title-field", joinPage.heroTitle);
  setValue("join-hero-highlight-field", joinPage.heroHighlight);
  setValue("join-hero-description-field", joinPage.heroDescription);
  setValue("join-help-tag-field", joinPage.helpTag);
  setValue("join-help-title-field", joinPage.helpTitle);
  setValue("join-help-text-field", joinPage.helpText);
  setValue("join-help-cta-label-field", joinPage.helpCtaLabel);
  setValue("join-help-cta-href-field", joinPage.helpCtaHref);
  setValue("join-signup-label-field", joinPage.signUpLabel);
  setValue("join-signup-href-field", joinPage.signUpHref);

  const joinStreams = (joinPage.streams || []).map((stream) => ({
    ...stream,
    stepsText: (stream.steps || []).join("\n")
  }));
  buildListEditor("join-streams-list", joinStreams, [
    { name: "id", label: "Anchor (no #)" },
    { name: "title", label: "Title" },
    { name: "badge", label: "Badge" },
    { name: "description", label: "Description", multiline: true },
    { name: "stepsText", label: "Steps (one per line)", multiline: true }
  ]);

  // Merch
  setValue("merch-hero-tag-field", merchPage.heroTag);
  setValue("merch-hero-title-field", merchPage.heroTitle);
  setValue("merch-hero-highlight-field", merchPage.heroHighlight);
  setValue("merch-store-tag-field", merchPage.storeTag);
  setValue("merch-store-title-field", merchPage.storeTitle);
  setValue("merch-store-highlight-field", merchPage.storeHighlight);
  setValue("merch-blurb-field", data.merch.blurb);
  setValue("merch-store-description-field", merchPage.storeDescription);
  setValue("merch-store-field", data.merch.storeUrl);
  setValue("merch-pillars-field", (merchPage.pillars || []).join("\n"));
  setValue("merch-cta-label-field", merchPage.ctaLabel);

  // Coaches
  setValue("coaches-hero-tag-field", coachesPage.heroTag);
  setValue("coaches-hero-title-field", coachesPage.heroTitle);
  setValue("coaches-hero-highlight-field", coachesPage.heroHighlight);
  setValue("coaches-blurb-field", data.coaches.blurb);
  const resourceDefaults =
    coachesPage.resources && coachesPage.resources.length
      ? coachesPage.resources
      : [
          { title: "Coaching Guide", description: "", ctaLabel: "Open guide", href: data.coaches?.guideUrl || "" },
          { title: "Templates", description: "", ctaLabel: "Download templates", href: data.coaches?.templatesUrl || "" }
        ];
  buildListEditor("coaches-resources-list", resourceDefaults, [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", multiline: true },
    { name: "ctaLabel", label: "CTA label" },
    { name: "href", label: "Link" }
  ]);
  setValue("coaches-cta-tag-field", coachesPage.ctaTag);
  setValue("coaches-cta-title-field", coachesPage.ctaTitle);
  setValue("coaches-cta-highlight-field", coachesPage.ctaHighlight);
  setValue("coaches-cta-label-field", coachesPage.ctaLabel);
  setValue("coaches-cta-href-field", coachesPage.ctaHref);
  setValue("coaches-cta-description-field", coachesPage.ctaDescription);

  // Sponsors page copy
  setValue("sponsors-hero-tag-field", sponsorsPage.heroTag);
  setValue("sponsors-hero-title-field", sponsorsPage.heroTitle);
  setValue("sponsors-hero-highlight-field", sponsorsPage.heroHighlight);
  setValue("sponsors-hero-desc-field", sponsorsPage.heroDescription);
  setValue("sponsors-cta-tag-field", sponsorsPage.ctaTag);
  setValue("sponsors-cta-title-field", sponsorsPage.ctaTitle);
  setValue("sponsors-cta-highlight-field", sponsorsPage.ctaHighlight);
  setValue("sponsors-cta-label-field", sponsorsPage.ctaLabel);
  setValue("sponsors-cta-href-field", sponsorsPage.ctaHref);
  setValue("sponsors-cta-desc-field", sponsorsPage.ctaDescription);
  setValue("sponsors-features-field", (sponsorsPage.features || []).join("\n"));

  // Gallery page copy
  setValue("gallery-hero-tag-field", galleryPage.heroTag);
  setValue("gallery-hero-title-field", galleryPage.heroTitle);
  setValue("gallery-hero-highlight-field", galleryPage.heroHighlight);
  setValue("gallery-hero-description-field", galleryPage.heroDescription);
  setValue("gallery-order-field", galleryPage.orderMode || "fixed");
  setValue("gallery-all-label-field", galleryPage.allLabel);
  setValue("gallery-empty-title-field", galleryPage.emptyTitle);
  setValue("gallery-empty-desc-field", galleryPage.emptyDescription);

  initCustomDropdowns();
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function attachAdminHandlers() {
  const saveBtn = document.getElementById("save-admin");
  const resetBtn = document.getElementById("reset-admin");
  const toast = document.getElementById("admin-toast");
  const exportBtn = document.getElementById("export-json");
  const importBtn = document.getElementById("import-json");
  const importInput = document.getElementById("import-json-input");
  const saveModal = document.getElementById("save-confirm-modal");
  const saveModalClose = document.getElementById("save-confirm-close");
  const galleryBulkBtn = document.getElementById("gallery-bulk-upload");
  const galleryBulkInput = document.getElementById("gallery-bulk-input");

  galleryBulkBtn?.addEventListener("click", () => galleryBulkInput?.click());
  galleryBulkInput?.addEventListener("change", (event) => {
    const files = event.target.files;
    handleGalleryBulkUpload(files);
    event.target.value = "";
  });

  saveBtn?.addEventListener("click", async () => {
    const data = loadSiteData();
    if (!data.pages) data.pages = {};
    const pages = data.pages;
    const home = pages.home || (pages.home = {});
    const aboutPage = pages.about || (pages.about = {});
    const joinPage = pages.join || (pages.join = {});
    const merchPage = pages.merch || (pages.merch = {});
    const coachesPage = pages.coaches || (pages.coaches = {});
    const sponsorsPage = pages.sponsors || (pages.sponsors = {});
    const galleryPage = pages.gallery || (pages.gallery = {});
    if (!data.navigation) data.navigation = {};
    if (!data.footer) data.footer = {};
    if (!data.about) data.about = {};
    const get = (id) => (document.getElementById(id)?.value || "").trim();

    data.hero.headline = document.getElementById("hero-headline").value.trim();
    data.hero.subhead = document.getElementById("hero-subhead").value.trim();
    data.hero.primaryCta.label = document.getElementById("hero-primary-label").value.trim();
    data.hero.primaryCta.href = document.getElementById("hero-primary-href").value.trim();
    data.hero.secondaryCta.label = document.getElementById("hero-secondary-label").value.trim();
    data.hero.secondaryCta.href = document.getElementById("hero-secondary-href").value.trim();

    data.club.tagline = document.getElementById("club-tagline").value.trim();
    data.club.homeIntro = document.getElementById("club-intro").value.trim();

    data.navigation.links = collectList("nav-links-list", ["label", "href", "key"].map((name) => ({ name })));
    data.navigation.adminLabel = get("nav-admin-label-field") || "Admin";

    data.footer.quickLinks = collectList("footer-links-list", ["label", "href"].map((name) => ({ name })));
    data.footer.tagline = get("footer-tagline-field");
    data.footer.note = get("footer-note-field");
    data.footer.quickLinksTitle = get("footer-quick-title-field");
    data.footer.connectTitle = get("footer-connect-title-field");
    data.footer.connectLinks = collectList("footer-connect-list", ["label", "href"].map((name) => ({ name })));

    home.heroKicker = get("home-hero-kicker-field");
    home.heroTitle = get("home-hero-title-field");
    home.heroHighlight = get("home-hero-highlight-field");
    home.programsTag = get("home-programs-tag-field");
    home.programsTitle = get("home-programs-title-field");
    home.storyTag = get("home-story-tag-field");
    home.storyTitle = get("home-story-title-field");
    home.storySubtitle = get("home-story-subtitle-field");
    home.galleryTag = get("home-gallery-tag-field");
    home.galleryTitle = get("home-gallery-title-field");
    home.gallerySubtitle = get("home-gallery-subtitle-field");
    home.newsTag = get("home-news-tag-field");
    home.newsTitle = get("home-news-title-field");
    home.linksTag = get("home-links-tag-field");
    home.linksTitle = get("home-links-title-field");
    home.linksCardTitle = get("home-links-card-title-field");
    home.linksCardText = get("home-links-card-text-field");
    home.sponsorsTag = get("home-sponsors-tag-field");
    home.sponsorsTitle = get("home-sponsors-title-field");
    home.sponsorsDescription = get("home-sponsors-desc-field");
    home.sponsorsCtaLabel = get("home-sponsors-cta-label");
    home.sponsorsCtaHref = get("home-sponsors-cta-href");
    home.ctaTag = get("home-cta-tag-field");
    home.ctaTitle = get("home-cta-title-field");
    home.ctaHighlight = get("home-cta-highlight-field");
    home.ctaDescription = get("home-cta-description-field");
    home.ctaPrimary = {
      label: get("home-cta-primary-label-field"),
      href: get("home-cta-primary-href-field")
    };
    home.ctaSecondary = {
      label: get("home-cta-secondary-label-field"),
      href: get("home-cta-secondary-href-field")
    };
    home.quote = {
      text: get("home-quote-text-field"),
      attribution: get("home-quote-attrib-field")
    };
    home.programs = collectList("home-programs-list", [
      { name: "title" },
      { name: "badge" },
      { name: "description" },
      { name: "ctaLabel" },
      { name: "ctaHref" }
    ]).filter((p) => p.title || p.description || p.ctaLabel || p.ctaHref);
    home.featuredPhotos = collectFeaturedPhotos("home-featured-photos");
    home.storyBlocks = collectList("home-story-list", [
      { name: "tag" },
      { name: "title" },
      { name: "summary" },
      { name: "bulletsText" }
    ])
      .map((block) => ({
        tag: block.tag || "",
        title: block.title || "",
        summary: block.summary || "",
        bullets: parseLines(block.bulletsText || "")
      }))
      .filter((block) => block.title || block.summary || (block.bullets && block.bullets.length));

    data.news = collectList("news-list", ["title", "date", "summary", "url"].map((name) => ({ name })));
    data.quickLinks = collectList("quick-links-list", ["label", "href"].map((name) => ({ name })));
    data.sponsors = collectSponsors("sponsor-list");
    
    // Collect gallery photos
    data.gallery = collectGalleryList();
    
    // Save uploaded images
    if (!data.images) data.images = {};
    if (window.pendingImages) {
      if (window.pendingImages.heroBackground) {
        data.images.heroBackground = window.pendingImages.heroBackground;
      }
      if (window.pendingImages.logo) {
        data.images.logo = window.pendingImages.logo;
      }
      window.pendingImages = {};
    }

    data.about.intro = document.getElementById("about-intro-field").value.trim();
    data.about.history = document.getElementById("about-history-field").value.trim();
    data.about.values = document.getElementById("about-values-field").value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    data.about.lifeMembers = document.getElementById("about-members-field").value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    data.about.snapshotTitle = get("about-snapshot-title-field");
    data.about.snapshotSubtitle = get("about-snapshot-subtitle-field");
    data.about.snapshotStats = collectList("about-snapshot-stats-list", [
      { name: "value" },
      { name: "label" },
      { name: "detail" }
    ]).filter((item) => item.value || item.label || item.detail);
    data.about.pillarsTitle = get("about-pillars-title-field");
    data.about.pillarsSubtitle = get("about-pillars-subtitle-field");
    data.about.pillars = collectList("about-pillars-list", [
      { name: "title" },
      { name: "description" }
    ]).filter((item) => item.title || item.description);
    data.about.initiativesTitle = get("about-initiatives-title-field");
    data.about.initiativesSubtitle = get("about-initiatives-subtitle-field");
    data.about.initiatives = collectList("about-initiatives-list", [
      { name: "title" },
      { name: "tag" },
      { name: "description" }
    ]).filter((item) => item.title || item.tag || item.description);
    data.about.photos = collectSimplePhotoList("about-photos-list");
    aboutPage.heroTag = get("about-hero-tag-field");
    aboutPage.heroTitle = get("about-hero-title-field");
    aboutPage.heroHighlight = get("about-hero-highlight-field");
    aboutPage.historyTitle = get("about-history-title-field");
    aboutPage.valuesTitle = get("about-values-title-field");
    aboutPage.lifeMembersTitle = get("about-life-title-field");
    aboutPage.contactTag = get("about-contact-tag-field");
    aboutPage.contactTitle = get("about-contact-title-field");
    aboutPage.contactHighlight = get("about-contact-highlight-field");
    aboutPage.contactCtaLabel = get("about-contact-cta-label");
    aboutPage.contactCtaHref = get("about-contact-cta-href");
    aboutPage.contactDescription = get("about-contact-desc-field");
    aboutPage.extraTag = get("about-extra-tag-field");
    aboutPage.extraTitle = get("about-extra-title-field");
    aboutPage.extraText = get("about-extra-text-field");
    aboutPage.lifeDescription = get("about-life-desc-field");

    joinPage.heroTag = get("join-hero-tag-field");
    joinPage.heroTitle = get("join-hero-title-field");
    joinPage.heroHighlight = get("join-hero-highlight-field");
    joinPage.heroDescription = get("join-hero-description-field");
    joinPage.helpTag = get("join-help-tag-field");
    joinPage.helpTitle = get("join-help-title-field");
    joinPage.helpText = get("join-help-text-field");
    joinPage.helpCtaLabel = get("join-help-cta-label-field");
    joinPage.helpCtaHref = get("join-help-cta-href-field");
    joinPage.signUpLabel = get("join-signup-label-field");
    joinPage.signUpHref = get("join-signup-href-field");
    const joinStreamsRaw = collectList("join-streams-list", [
      { name: "id" },
      { name: "title" },
      { name: "badge" },
      { name: "description" },
      { name: "stepsText" }
    ]);
    joinPage.streams = joinStreamsRaw
      .map((stream) => ({
        id: stream.id || "",
        title: stream.title || "",
        badge: stream.badge || "",
        description: stream.description || "",
        steps: parseLines(stream.stepsText || "")
      }))
      .filter((stream) => stream.title || stream.description || (stream.steps && stream.steps.length));
    data.join.u8u10 = joinPage.streams[0]?.description || "";
    data.join.juniors = joinPage.streams[1]?.description || "";

    data.merch.blurb = document.getElementById("merch-blurb-field").value.trim();
    data.merch.storeUrl = document.getElementById("merch-store-field").value.trim();
    merchPage.heroTag = get("merch-hero-tag-field");
    merchPage.heroTitle = get("merch-hero-title-field");
    merchPage.heroHighlight = get("merch-hero-highlight-field");
    merchPage.storeTag = get("merch-store-tag-field");
    merchPage.storeTitle = get("merch-store-title-field");
    merchPage.storeHighlight = get("merch-store-highlight-field");
    merchPage.storeDescription = get("merch-store-description-field");
    merchPage.pillars = parseLines(get("merch-pillars-field"));
    merchPage.ctaLabel = get("merch-cta-label-field");

    data.coaches.blurb = document.getElementById("coaches-blurb-field").value.trim();
    coachesPage.heroTag = get("coaches-hero-tag-field");
    coachesPage.heroTitle = get("coaches-hero-title-field");
    coachesPage.heroHighlight = get("coaches-hero-highlight-field");
    coachesPage.resources = collectList("coaches-resources-list", [
      { name: "title" },
      { name: "description" },
      { name: "ctaLabel" },
      { name: "href" }
    ]).filter((item) => item.title || item.description || item.href);
    data.coaches.guideUrl = coachesPage.resources?.[0]?.href || "";
    data.coaches.templatesUrl = coachesPage.resources?.[1]?.href || "";
    coachesPage.ctaTag = get("coaches-cta-tag-field");
    coachesPage.ctaTitle = get("coaches-cta-title-field");
    coachesPage.ctaHighlight = get("coaches-cta-highlight-field");
    coachesPage.ctaLabel = get("coaches-cta-label-field");
    coachesPage.ctaHref = get("coaches-cta-href-field");
    coachesPage.ctaDescription = get("coaches-cta-description-field");

    sponsorsPage.heroTag = get("sponsors-hero-tag-field");
    sponsorsPage.heroTitle = get("sponsors-hero-title-field");
    sponsorsPage.heroHighlight = get("sponsors-hero-highlight-field");
    sponsorsPage.heroDescription = get("sponsors-hero-desc-field");
    sponsorsPage.ctaTag = get("sponsors-cta-tag-field");
    sponsorsPage.ctaTitle = get("sponsors-cta-title-field");
    sponsorsPage.ctaHighlight = get("sponsors-cta-highlight-field");
    sponsorsPage.ctaLabel = get("sponsors-cta-label-field");
    sponsorsPage.ctaHref = get("sponsors-cta-href-field");
    sponsorsPage.ctaDescription = get("sponsors-cta-desc-field");
    sponsorsPage.features = parseLines(get("sponsors-features-field"));

    galleryPage.heroTag = get("gallery-hero-tag-field");
    galleryPage.heroTitle = get("gallery-hero-title-field");
    galleryPage.heroHighlight = get("gallery-hero-highlight-field");
    galleryPage.heroDescription = get("gallery-hero-description-field");
    galleryPage.orderMode = get("gallery-order-field") || "fixed";
    galleryPage.allLabel = get("gallery-all-label-field");
    galleryPage.emptyTitle = get("gallery-empty-title-field");
    galleryPage.emptyDescription = get("gallery-empty-desc-field");

    const localResult = saveSiteData(data);
    const localStatus = localResult?.ok
      ? (localResult.truncated ? "truncated" : "ok")
      : "failed";

    // Try pushing to the server API
    try {
      const token = await ensureApiToken();
      await fetch(`${getApiBase()}/api/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }).then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("adminApiToken");
        }
        if (!res.ok) {
          throw new Error(`Save failed ${res.status}`);
        }
      });
      localStorage.removeItem("clubSiteData");
      localStorage.removeItem("clubSiteDataFetchedAt");
      if (localStatus === "failed") {
        showToast(toast, "Saved to server. Local cache could not be updated (browser storage full).");
      } else if (localStatus === "truncated") {
        showToast(toast, "Saved to server. Local cache trimmed to fit storage (large images not cached).");
      } else {
        showToast(toast, "Saved to server. Refresh public pages to see changes.");
      }
      if (saveModal) {
        saveModal.classList.remove("hidden");
        saveModal.classList.add("flex");
      }
    } catch (err) {
      console.warn("Server save failed; data saved locally only", err);
      if (localStatus === "failed") {
        showToast(toast, "Save failed. Browser storage is full and the server update failed.");
      } else if (localStatus === "truncated") {
        showToast(toast, "Saved locally without large images. Server update failed.");
      } else {
        showToast(toast, "Saved locally. Server update failed.");
      }
    }
  });

  exportBtn?.addEventListener("click", () => {
    const data = loadSiteData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "site-data.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  importBtn?.addEventListener("click", () => importInput?.click());
  importInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importResult = saveSiteData(parsed);
        hydrateAdminForms();
        if (importResult?.ok) {
          showToast(
            toast,
            importResult.truncated
              ? "Imported data applied (large images omitted to fit storage)."
              : "Imported data applied."
          );
        } else {
          showToast(toast, "Import failed. Browser storage is full.");
        }
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  resetBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all content to defaults?")) {
      resetSiteData();
      hydrateAdminForms();
      showToast(toast, "Reset to default content.");
    }
  });

  saveModalClose?.addEventListener("click", () => {
    if (saveModal) {
      saveModal.classList.add("hidden");
      saveModal.classList.remove("flex");
    }
  });
}

function showToast(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  el.style.display = "inline-block";
  setTimeout(() => {
    el.classList.add("hidden");
    el.style.display = "";
  }, 3000);
}

window.addEventListener("DOMContentLoaded", () => {
  const unlockPromise =
    localStorage.getItem("adminAccess") === "granted" && isAdminSessionValid()
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("admin:unlocked", resolve, { once: true }));

  Promise.resolve(checkAdminPassword())
    .catch(() => {})
    .finally(() => {
      unlockPromise.then(() => {
        hydrateAdminForms();
        attachAdminHandlers();
      });
    });
});

window.addEventListener("sitecontent:updated", () => {
  hydrateAdminForms();
});
