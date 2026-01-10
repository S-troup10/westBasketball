
(() => {
  const state = {
    data: loadSiteData(),
    dirty: false
  };
  const contentUrl =
    (typeof window !== "undefined" && window.CONTENT_URL) ||
    "https://site-content-worker.simontroup27.workers.dev/content";

  const toast = document.getElementById("admin-toast");
  const confirmModal = document.getElementById("save-confirm-modal");
  const confirmClose = document.getElementById("save-confirm-close");
  let toastTimer = null;

  const escapeHtml = (value = "") =>
    value
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const escapeAttr = (value = "") => escapeHtml(value);

  const parseLines = (value = "") =>
    value
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

  const todayIso = () => new Date().toISOString().slice(0, 10);

  const joinLines = (list) => (Array.isArray(list) ? list.join("\n") : "");

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const getValue = (path, fallback) => {
    let current = state.data;
    for (const key of path) {
      if (!current || typeof current !== "object" || !(key in current)) {
        return fallback;
      }
      current = current[key];
    }
    return current ?? fallback;
  };

  const setValue = (path, value) => {
    let current = state.data;
    for (let i = 0; i < path.length - 1; i += 1) {
      const key = path[i];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = typeof path[i + 1] === "number" ? [] : {};
      }
      current = current[key];
    }
    current[path[path.length - 1]] = value;
  };

  const showToast = (message, isError = false) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.toggle("text-red-400", isError);
    toast.classList.toggle("text-primary", !isError);
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.add("hidden"), 2400);
  };

  const markDirty = () => {
    state.dirty = true;
  };

  const bindTextField = (id, path, options = {}) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rawValue = getValue(path, options.defaultValue);
    const displayValue = options.list ? joinLines(rawValue) : rawValue ?? "";
    if (el.value !== displayValue) {
      el.value = displayValue;
    }
    if (el.dataset.bound) return;
    el.dataset.bound = "true";
    const handler = () => {
      let value = el.value;
      if (options.list) value = parseLines(value);
      if (options.trim !== false && typeof value === "string") value = value.trim();
      setValue(path, value);
      markDirty();
    };
    el.addEventListener("input", handler);
  };

  const updateImagePreview = (previewId, placeholderId, src) => {
    const preview = document.getElementById(previewId);
    const placeholder = document.getElementById(placeholderId);
    if (!preview || !placeholder) return;
    if (src) {
      preview.src = src;
      preview.classList.remove("hidden");
      placeholder.classList.add("hidden");
    } else {
      preview.classList.add("hidden");
      placeholder.classList.remove("hidden");
    }
  };

  const updateInlinePreview = (preview, placeholder, src) => {
    if (!preview || !placeholder) return;
    if (src) {
      preview.src = src;
      preview.classList.remove("hidden");
      placeholder.classList.add("hidden");
    } else {
      preview.classList.add("hidden");
      placeholder.classList.remove("hidden");
    }
  };

  const imageFieldMap = {
    heroBackground: { path: ["images", "heroBackground"] },
    logo: { path: ["images", "logo"] },
    joinFeatureImage: { path: ["pages", "join", "featureImage"] },
    aboutHighlightPhoto: { path: ["about", "highlightPhoto"] },
    aboutHighlightPoster: { path: ["about", "highlightPoster"] },
    merchSupplierLogo: { path: ["merch", "supplier", "logo"] }
  };

  window.handleImageUpload = (input, key, previewId, placeholderId) => {
    const files = input.files;
    if (!files || !files.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result?.toString() || "";
      const config = imageFieldMap[key];
      if (config) {
        setValue(config.path, src);
        markDirty();
      }
      updateImagePreview(previewId, placeholderId, src);
    };
    reader.readAsDataURL(file);
  };

  const initImageFields = () => {
    updateImagePreview(
      "hero-image-preview",
      "hero-image-placeholder",
      getValue(["images", "heroBackground"], "")
    );
    updateImagePreview(
      "logo-image-preview",
      "logo-image-placeholder",
      getValue(["images", "logo"], "")
    );
    updateImagePreview(
      "join-feature-image-preview",
      "join-feature-image-placeholder",
      getValue(["pages", "join", "featureImage"], "")
    );
    updateImagePreview(
      "about-highlight-photo-preview",
      "about-highlight-photo-placeholder",
      getValue(["about", "highlightPhoto"], "")
    );
    updateImagePreview(
      "about-highlight-poster-preview",
      "about-highlight-poster-placeholder",
      getValue(["about", "highlightPoster"], "")
    );
    updateImagePreview(
      "merch-supplier-logo-preview",
      "merch-supplier-logo-placeholder",
      getValue(["merch", "supplier", "logo"], "")
    );
  };

  const initDropdown = (inputId, path) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const dropdown = input.closest("[data-dropdown]");
    const label = dropdown?.querySelector("[data-dropdown-label]");
    const setLabel = () => {
      if (!label) return;
      const option = dropdown?.querySelector(`[data-dropdown-option][data-value="${input.value}"]`);
      label.textContent = option?.textContent?.trim() || "Select";
    };
    const savedValue = getValue(path, input.value || "");
    if (savedValue !== undefined) input.value = savedValue;
    setLabel();
    if (dropdown?.dataset.bound) return;
    dropdown.dataset.bound = "true";
    dropdown.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-dropdown-trigger]");
      const option = event.target.closest("[data-dropdown-option]");
      const menu = dropdown.querySelector("[data-dropdown-menu]");
      if (trigger && menu) {
        menu.classList.toggle("hidden");
      }
      if (option) {
        const value = option.getAttribute("data-value") || "";
        input.value = value;
        setValue(path, value);
        markDirty();
        setLabel();
        if (menu) menu.classList.add("hidden");
      }
    });
    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        const menu = dropdown.querySelector("[data-dropdown-menu]");
        if (menu) menu.classList.add("hidden");
      }
    });
  };

  const initListEditor = (config) => {
    const container = document.getElementById(config.containerId);
    if (!container) return;

    const getItems = () => {
      const items = getValue(config.path, []);
      return Array.isArray(items) ? items : [];
    };
    const setItems = (items) => {
      setValue(config.path, items);
      markDirty();
    };
    const normalizeItem = (item) => {
      if (config.itemType === "string") return { value: item ?? "" };
      return item && typeof item === "object" ? { ...item } : {};
    };
    const denormalizeItem = (item) => {
      if (config.itemType === "string") return (item.value ?? "").toString();
      return item;
    };

    const renderItem = (item, index) => {
      const data = normalizeItem(item);
      const hasImageField = config.fields.some((field) => field.type === "image");
      const previewKey = config.previewKey;
      const previewValue = previewKey ? (data[previewKey] ?? "") : "";
      const previewMarkup = previewKey && !hasImageField
        ? `
          <div class="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            <img data-preview-key="${escapeAttr(previewKey)}" src="${escapeAttr(previewValue)}" alt="Preview" class="w-full h-32 object-cover ${previewValue ? "" : "hidden"}" loading="lazy" />
            <div data-preview-placeholder="${escapeAttr(previewKey)}" class="h-32 flex items-center justify-center text-xs text-white/40 ${previewValue ? "hidden" : ""}">No image</div>
          </div>
        `
        : "";
      const fieldMarkup = config.fields
        .map((field) => {
          const value = data[field.key] ?? field.defaultValue ?? "";
          const displayValue = field.list ? joinLines(value) : value;
          const fieldLabel = field.label
            ? `<label class="text-xs text-white/50 uppercase tracking-wider field-label">${escapeHtml(field.label)}</label>`
            : "";
          const baseClass = "w-full input-field rounded-xl px-4 py-3 text-white text-sm";
          const textareaClass = `${baseClass} resize-none`;
          const inputType = field.inputType || "text";
          const wrapperClass = field.fullWidth ? "md:col-span-2 space-y-1.5" : "space-y-1.5";
          if (field.type === "image") {
            const inputId = `${config.containerId}-${index}-${field.key}`;
            const previewId = `${inputId}-preview`;
            const placeholderId = `${inputId}-placeholder`;
            const hasValue = Boolean(displayValue);
            const uploadCopy = field.placeholder || "Click to upload image";
            return `
              <div class="${wrapperClass}">
                ${fieldLabel}
                <label class="image-upload-area border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block" for="${escapeAttr(inputId)}">
                  <img id="${escapeAttr(previewId)}" data-image-preview="${escapeAttr(field.key)}" src="${escapeAttr(displayValue)}" alt="Preview" class="${hasValue ? "" : "hidden"} w-full object-cover rounded-lg mb-3 upload-preview" />
                  <div id="${escapeAttr(placeholderId)}" data-image-placeholder="${escapeAttr(field.key)}" class="${hasValue ? "hidden" : ""} space-y-2 upload-placeholder">
                    <svg class="w-8 h-8 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p class="text-sm text-white/50">${escapeHtml(uploadCopy)}</p>
                  </div>
                </label>
                <input type="file" id="${escapeAttr(inputId)}" data-field="${escapeAttr(field.key)}" data-image-input="true" accept="image/*" class="hidden" />
                <button type="button" class="text-xs text-white/50 hover:text-white" data-action="clear-image" data-field="${escapeAttr(field.key)}">Clear image</button>
              </div>
            `;
          }
          if (field.type === "textarea") {
            return `
              <div class="${wrapperClass}">
                ${fieldLabel}
                <textarea data-field="${field.key}" data-field-type="${field.list ? "list" : "text"}" rows="${field.rows || 2}" class="${textareaClass}" placeholder="${escapeAttr(field.placeholder || "")}">${escapeHtml(displayValue)}</textarea>
              </div>
            `;
          }
          return `
            <div class="${wrapperClass}">
              ${fieldLabel}
              <input data-field="${field.key}" data-field-type="${field.list ? "list" : "text"}" type="${inputType}" class="${baseClass}" placeholder="${escapeAttr(field.placeholder || "")}" value="${escapeAttr(displayValue)}" />
            </div>
          `;
        })
        .join("");

      const isGridLayout = typeof config.layout === "string" && config.layout.startsWith("grid-");
      const itemClass = isGridLayout
        ? "glass rounded-2xl p-4 space-y-4 h-full flex flex-col"
        : "glass rounded-2xl p-4 space-y-4";
      const fieldsClass =
        config.layout === "grid-3" ? "grid gap-3" : "grid md:grid-cols-2 gap-3";
      return `
        <div class="${itemClass}" data-item-index="${index}">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-white/70">${escapeHtml(config.itemLabel || "Item")} ${index + 1}</p>
            <div class="flex items-center gap-2">
              <button type="button" class="px-3 py-1 rounded-full border border-white/10 text-xs text-white/60 hover:text-white" data-action="move-up">Up</button>
              <button type="button" class="px-3 py-1 rounded-full border border-white/10 text-xs text-white/60 hover:text-white" data-action="move-down">Down</button>
              <button type="button" class="px-3 py-1 rounded-full border border-white/10 text-xs text-red-300 hover:text-red-200" data-action="remove">Remove</button>
            </div>
          </div>
          ${previewMarkup}
          <div class="${fieldsClass}">
            ${fieldMarkup}
          </div>
        </div>
      `;
    };

    const render = () => {
      const items = getItems();
      let listClass = "space-y-4";
      if (config.layout === "grid-3") {
        listClass = "grid gap-4 md:grid-cols-3";
      } else if (config.layout === "grid-2") {
        listClass = "grid gap-4 md:grid-cols-2";
      }
      container.innerHTML = `
        <div class="${listClass}">
          ${items.map(renderItem).join("")}
        </div>
        <button type="button" class="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:border-primary/50 hover:text-primary transition-all" data-action="add">
          Add ${escapeHtml(config.itemLabel || "item")}
        </button>
      `;
    };

    if (!container.dataset.bound) {
      container.dataset.bound = "true";
      container.addEventListener("input", (event) => {
        if (event.target.type === "file") return;
        const field = event.target.dataset.field;
        if (!field) return;
        const itemEl = event.target.closest("[data-item-index]");
        if (!itemEl) return;
        const index = Number(itemEl.dataset.itemIndex);
        const items = getItems();
        const item = normalizeItem(items[index]);
        let value = event.target.value;
        if (event.target.dataset.fieldType === "list") {
          value = parseLines(value);
        }
        item[field] = value;
        items[index] = denormalizeItem(item);
        setItems(items);
      });
      container.addEventListener("change", (event) => {
        const input = event.target;
        if (!input.matches('input[type="file"][data-field]')) return;
        const itemEl = input.closest("[data-item-index]");
        if (!itemEl) return;
        const field = input.dataset.field;
        const index = Number(itemEl.dataset.itemIndex);
        const files = input.files;
        if (!files || !files.length) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result?.toString() || "";
          const items = getItems();
          const item = normalizeItem(items[index]);
          item[field] = src;
          items[index] = denormalizeItem(item);
          setItems(items);
          updateInlinePreview(
            itemEl.querySelector(`[data-image-preview="${field}"]`),
            itemEl.querySelector(`[data-image-placeholder="${field}"]`),
            src
          );
          updateInlinePreview(
            itemEl.querySelector(`[data-preview-key="${field}"]`),
            itemEl.querySelector(`[data-preview-placeholder="${field}"]`),
            src
          );
          input.value = "";
        };
        reader.readAsDataURL(file);
      });
      container.addEventListener("click", (event) => {
        const action = event.target.dataset.action;
        if (!action) return;
        const items = getItems();
        if (action === "add") {
          const baseItem = config.defaultItem ?? (config.itemType === "string" ? "" : {});
          let nextItem = clone(baseItem);
          if (
            config.autoDateField &&
            nextItem &&
            typeof nextItem === "object" &&
            !Array.isArray(nextItem) &&
            !nextItem[config.autoDateField]
          ) {
            nextItem[config.autoDateField] = todayIso();
          }
          items.push(nextItem);
          setItems(items);
          render();
          return;
        }
        const itemEl = event.target.closest("[data-item-index]");
        if (!itemEl) return;
        const index = Number(itemEl.dataset.itemIndex);
        if (action === "clear-image") {
          const field = event.target.dataset.field;
          const item = normalizeItem(items[index]);
          item[field] = "";
          items[index] = denormalizeItem(item);
          setItems(items);
          updateInlinePreview(
            itemEl.querySelector(`[data-image-preview="${field}"]`),
            itemEl.querySelector(`[data-image-placeholder="${field}"]`),
            ""
          );
          updateInlinePreview(
            itemEl.querySelector(`[data-preview-key="${field}"]`),
            itemEl.querySelector(`[data-preview-placeholder="${field}"]`),
            ""
          );
          const fileInput = itemEl.querySelector(`input[type="file"][data-field="${field}"]`);
          if (fileInput) fileInput.value = "";
          return;
        }
        if (action === "remove") {
          items.splice(index, 1);
          setItems(items);
          render();
        }
        if (action === "move-up" && index > 0) {
          [items[index - 1], items[index]] = [items[index], items[index - 1]];
          setItems(items);
          render();
        }
        if (action === "move-down" && index < items.length - 1) {
          [items[index + 1], items[index]] = [items[index], items[index + 1]];
          setItems(items);
          render();
        }
      });
    }

    render();
  };

  const initJoinStreamsEditor = () => {
    const container = document.getElementById("join-streams-list");
    if (!container) return;

    const getStreams = () => {
      const streams = getValue(["pages", "join", "streams"], []);
      return Array.isArray(streams) ? streams : [];
    };

    const setStreams = (streams) => {
      setValue(["pages", "join", "streams"], streams);
      markDirty();
    };

    const renderFaqs = (faqs) =>
      faqs
        .map(
          (faq, faqIndex) => `
          <div class="border border-white/10 rounded-xl p-3 space-y-2" data-faq-index="${faqIndex}">
            <input data-faq-field="question" class="w-full input-field rounded-xl px-3 py-2 text-white text-sm" placeholder="Question" value="${escapeAttr(faq.question || "")}" />
            <textarea data-faq-field="answer" rows="2" class="w-full input-field rounded-xl px-3 py-2 text-white text-sm resize-none" placeholder="Answer">${escapeHtml(faq.answer || "")}</textarea>
            <button type="button" class="text-xs text-red-300 hover:text-red-200" data-faq-action="remove">Remove FAQ</button>
          </div>
        `
        )
        .join("");

    const render = () => {
      const streams = getStreams();
      container.innerHTML = `
        <div class="space-y-4">
          ${streams
            .map((stream, index) => {
              const stepsText = joinLines(stream.steps || []);
              const faqs = Array.isArray(stream.faqs) ? stream.faqs : [];
              return `
                <div class="glass rounded-2xl p-4 space-y-4" data-stream-index="${index}">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold text-white/70">Stream ${index + 1}</p>
                    <div class="flex items-center gap-2">
                      <button type="button" class="px-3 py-1 rounded-full border border-white/10 text-xs text-white/60 hover:text-white" data-action="move-up">Up</button>
                      <button type="button" class="px-3 py-1 rounded-full border border-white/10 text-xs text-white/60 hover:text-white" data-action="move-down">Down</button>
                      <button type="button" class="px-3 py-1 rounded-full border border-white/10 text-xs text-red-300 hover:text-red-200" data-action="remove">Remove</button>
                    </div>
                  </div>
                  <div class="grid md:grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">ID</label>
                      <input data-field="id" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="u8s" value="${escapeAttr(stream.id || "")}" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">Title</label>
                      <input data-field="title" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="Program title" value="${escapeAttr(stream.title || "")}" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">Badge</label>
                      <input data-field="badge" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="Badge" value="${escapeAttr(stream.badge || "")}" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">Kicker</label>
                      <input data-field="kicker" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="Kicker text" value="${escapeAttr(stream.kicker || "")}" />
                    </div>
                    <div class="space-y-1.5 md:col-span-2">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">Description</label>
                      <textarea data-field="description" rows="3" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm resize-none" placeholder="Description">${escapeHtml(stream.description || "")}</textarea>
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">CTA Label</label>
                      <input data-field="ctaLabel" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="Learn more" value="${escapeAttr(stream.ctaLabel || "")}" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">CTA Link</label>
                      <input data-field="ctaHref" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="https://..." value="${escapeAttr(stream.ctaHref || "")}" />
                    </div>
                    <div class="space-y-1.5 md:col-span-2">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">Image upload</label>
                      <label class="image-upload-area border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block" for="join-stream-image-${index}">
                        <img data-stream-image-preview src="${escapeAttr(stream.image || "")}" alt="Preview" class="${stream.image ? "" : "hidden"} w-full object-cover rounded-lg mb-3 upload-preview" />
                        <div data-stream-image-placeholder class="${stream.image ? "hidden" : ""} space-y-2 upload-placeholder">
                          <svg class="w-8 h-8 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <p class="text-sm text-white/50">Click to upload stream image</p>
                        </div>
                      </label>
                      <input type="file" id="join-stream-image-${index}" data-stream-field="image" accept="image/*" class="hidden" />
                      <button type="button" class="text-xs text-white/50 hover:text-white" data-stream-action="clear-image">Clear image</button>
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">Image Alt</label>
                      <input data-field="imageAlt" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="Alt text" value="${escapeAttr(stream.imageAlt || "")}" />
                    </div>
                    <div class="space-y-1.5 md:col-span-2">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">Steps (one per line)</label>
                      <textarea data-field="steps" data-field-type="list" rows="3" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm resize-none" placeholder="Step 1">${escapeHtml(stepsText)}</textarea>
                    </div>
                    <div class="space-y-1.5 md:col-span-2">
                      <label class="text-xs text-white/50 uppercase tracking-wider field-label">More Info Label</label>
                      <input data-field="moreInfoLabel" class="w-full input-field rounded-xl px-4 py-3 text-white text-sm" placeholder="More info" value="${escapeAttr(stream.moreInfoLabel || "")}" />
                    </div>
                  </div>
                  <div class="border-t border-white/10 pt-4 space-y-3" data-faq-list>
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-semibold text-white">FAQs</p>
                      <button type="button" class="text-xs text-primary hover:text-white" data-faq-action="add">Add FAQ</button>
                    </div>
                    <div class="space-y-3">
                      ${renderFaqs(faqs)}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
        <button type="button" class="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:border-primary/50 hover:text-primary transition-all" data-action="add">
          Add stream
        </button>
      `;
    };

    if (!container.dataset.bound) {
      container.dataset.bound = "true";
      container.addEventListener("input", (event) => {
        if (event.target.type === "file") return;
        const streamEl = event.target.closest("[data-stream-index]");
        if (!streamEl) return;
        const index = Number(streamEl.dataset.streamIndex);
        const streams = getStreams();
        const stream = { ...(streams[index] || {}) };
        if (event.target.dataset.faqField) {
          const faqEl = event.target.closest("[data-faq-index]");
          if (!faqEl) return;
          const faqIndex = Number(faqEl.dataset.faqIndex);
          const faqs = Array.isArray(stream.faqs) ? [...stream.faqs] : [];
          const faq = { ...(faqs[faqIndex] || {}) };
          faq[event.target.dataset.faqField] = event.target.value;
          faqs[faqIndex] = faq;
          stream.faqs = faqs;
          streams[index] = stream;
          setStreams(streams);
          return;
        }
        const field = event.target.dataset.field;
        if (!field) return;
        let value = event.target.value;
        if (event.target.dataset.fieldType === "list") {
          value = parseLines(value);
        }
        stream[field] = value;
        streams[index] = stream;
        setStreams(streams);
      });
      container.addEventListener("change", (event) => {
        const input = event.target;
        if (!input.matches('input[type="file"][data-stream-field]')) return;
        const streamEl = input.closest("[data-stream-index]");
        if (!streamEl) return;
        const index = Number(streamEl.dataset.streamIndex);
        const field = input.dataset.streamField;
        const files = input.files;
        if (!files || !files.length) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result?.toString() || "";
          const streams = getStreams();
          const stream = { ...(streams[index] || {}) };
          stream[field] = src;
          streams[index] = stream;
          setStreams(streams);
          updateInlinePreview(
            streamEl.querySelector("[data-stream-image-preview]"),
            streamEl.querySelector("[data-stream-image-placeholder]"),
            src
          );
          input.value = "";
        };
        reader.readAsDataURL(file);
      });
      container.addEventListener("click", (event) => {
        const action = event.target.dataset.action;
        const faqAction = event.target.dataset.faqAction;
        const streamAction = event.target.dataset.streamAction;
        const streamEl = event.target.closest("[data-stream-index]");
        const streams = getStreams();
        if (action === "add") {
          streams.push({
            id: "",
            title: "",
            badge: "",
            kicker: "",
            description: "",
            ctaLabel: "",
            ctaHref: "",
            image: "",
            imageAlt: "",
            steps: [],
            moreInfoLabel: "",
            faqs: []
          });
          setStreams(streams);
          render();
          return;
        }
        if (!streamEl) return;
        const index = Number(streamEl.dataset.streamIndex);
        if (streamAction === "clear-image") {
          const stream = { ...(streams[index] || {}) };
          stream.image = "";
          streams[index] = stream;
          setStreams(streams);
          updateInlinePreview(
            streamEl.querySelector("[data-stream-image-preview]"),
            streamEl.querySelector("[data-stream-image-placeholder]"),
            ""
          );
          const fileInput = streamEl.querySelector('input[type="file"][data-stream-field="image"]');
          if (fileInput) fileInput.value = "";
          return;
        }
        if (action === "remove") {
          streams.splice(index, 1);
          setStreams(streams);
          render();
          return;
        }
        if (action === "move-up" && index > 0) {
          [streams[index - 1], streams[index]] = [streams[index], streams[index - 1]];
          setStreams(streams);
          render();
          return;
        }
        if (action === "move-down" && index < streams.length - 1) {
          [streams[index + 1], streams[index]] = [streams[index], streams[index + 1]];
          setStreams(streams);
          render();
          return;
        }
        if (faqAction) {
          const stream = { ...(streams[index] || {}) };
          const faqs = Array.isArray(stream.faqs) ? [...stream.faqs] : [];
          if (faqAction === "add") {
            faqs.push({ question: "", answer: "" });
            stream.faqs = faqs;
            streams[index] = stream;
            setStreams(streams);
            render();
            return;
          }
          if (faqAction === "remove") {
            const faqEl = event.target.closest("[data-faq-index]");
            if (!faqEl) return;
            const faqIndex = Number(faqEl.dataset.faqIndex);
            faqs.splice(faqIndex, 1);
            stream.faqs = faqs;
            streams[index] = stream;
            setStreams(streams);
            render();
          }
        }
      });
    }

    render();
  };

  const initBulkGalleryUpload = () => {
    const bulkBtn = document.getElementById("gallery-bulk-upload");
    const bulkInput = document.getElementById("gallery-bulk-input");
    if (!bulkBtn || !bulkInput || bulkInput.dataset.bound) return;
    bulkInput.dataset.bound = "true";
    bulkBtn.addEventListener("click", () => bulkInput.click());
    bulkInput.addEventListener("change", async () => {
      const files = Array.from(bulkInput.files || []);
      if (!files.length) return;
      const readFile = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result?.toString() || "");
          reader.onerror = () => reject(new Error("read failed"));
          reader.readAsDataURL(file);
        });
      try {
        const sources = await Promise.all(files.map(readFile));
        const gallery = getValue(["gallery"], []);
        const nextGallery = Array.isArray(gallery) ? [...gallery] : [];
        sources.forEach((src) => {
          if (src) nextGallery.push({ src, caption: "", category: "" });
        });
        setValue(["gallery"], nextGallery);
        markDirty();
        initListEditor(listConfigs.gallery);
      } catch (err) {
        showToast("Unable to read one of the images.", true);
      } finally {
        bulkInput.value = "";
      }
    });
  };

  const ensureFieldLabels = () => {
    const fields = document.querySelectorAll(".input-field");
    fields.forEach((field) => {
      if (field.dataset.autoLabeled) return;
      if (field.closest("label")) return;
      if (field.id) {
        const labelSelector = `label[for="${field.id}"]`;
        if (document.querySelector(labelSelector)) return;
      }
      const parent = field.parentElement;
      if (parent) {
        const hasDirectLabel = Array.from(parent.children).some(
          (child) => child.tagName === "LABEL"
        );
        if (hasDirectLabel) return;
      }
      const placeholder = field.getAttribute("placeholder") || "";
      const isSample = /https?:|mailto:|images\/|\.html|\.pdf|\.zip|\.png|\.jpg|\.jpeg/i.test(placeholder);
      const fallbackRaw = field.id ? field.id.replace(/[-_]+/g, " ") : "Field";
      const fallback = fallbackRaw
        .replace(/\bcta\b/gi, "CTA")
        .replace(/\bhref\b/gi, "link")
        .replace(/\burl\b/gi, "URL")
        .replace(/\bfield\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      const labelHint =
        /tag|title|label|link|url|subtitle|description|caption|quote|attribution|headline|subhead|kicker|intro|note|name|summary|category|badge|role|bio|question|answer|value|detail|highlight|cta|hero|program|gallery|news|sponsor|contact|help|feature|story|stat|pillar|initiative|resource|stream|season|schedule|location|coach|guide/i.test(
          placeholder
        );
      let labelText = (field.dataset.label || (!isSample && labelHint ? placeholder : "") || fallback)
        .replace(/^e\.g\.\s*/i, "")
        .trim();
      if (!labelText) return;
      labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1);
      const wrapper = document.createElement("div");
      wrapper.className = "space-y-1.5";
      const spanClasses = Array.from(field.classList).filter((cls) =>
        cls.includes("col-span")
      );
      spanClasses.forEach((cls) => {
        wrapper.classList.add(cls);
        field.classList.remove(cls);
      });
      const label = document.createElement("label");
      label.className = "text-xs font-medium text-white/50 uppercase tracking-wider field-label";
      label.textContent = labelText;
      if (field.id) label.htmlFor = field.id;
      field.parentNode.insertBefore(wrapper, field);
      wrapper.appendChild(label);
      wrapper.appendChild(field);
      field.dataset.autoLabeled = "true";
    });
  };

  const applyAdminFilter = () => {
    const tabBar = document.getElementById("admin-tabs");
    if (!tabBar) return;
    const tabs = Array.from(tabBar.querySelectorAll("[data-admin-tab]"));
    const storedTab = localStorage.getItem("adminActiveTab") || "all";
    const validTabs = tabs.map((tab) => tab.dataset.adminTab);
    const activeTab = validTabs.includes(storedTab) ? storedTab : "all";
    if (activeTab !== storedTab) {
      localStorage.setItem("adminActiveTab", activeTab);
    }
    const blocks = Array.from(document.querySelectorAll("[data-admin-page]"));
    const groups = Array.from(document.querySelectorAll("[data-admin-group]"));
    tabs.forEach((tab) => {
      tab.classList.toggle("admin-tab--active", tab.dataset.adminTab === activeTab);
    });
    blocks.forEach((block) => {
      const pages = (block.dataset.adminPage || "")
        .split(/\s+/)
        .map((page) => page.trim())
        .filter(Boolean);
      const show = activeTab === "all" || pages.includes(activeTab);
      block.classList.toggle("hidden", !show);
    });
    groups.forEach((group) => {
      const hasVisibleChild = group.querySelector("[data-admin-page]:not(.hidden)");
      group.classList.toggle("hidden", !hasVisibleChild);
    });
  };

  const initAdminTabs = () => {
    const tabBar = document.getElementById("admin-tabs");
    if (!tabBar) return;
    if (tabBar.dataset.bound) {
      applyAdminFilter();
      return;
    }
    tabBar.dataset.bound = "true";
    const tabs = Array.from(tabBar.querySelectorAll("[data-admin-tab]"));
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.dataset.adminTab || "all";
        localStorage.setItem("adminActiveTab", key);
        applyAdminFilter();
      });
    });
    applyAdminFilter();
  };

  const listConfigs = {
    news: {
      containerId: "news-list",
      path: ["news"],
      itemLabel: "News item",
      previewKey: "image",
      autoDateField: "date",
      defaultItem: { title: "", date: "", summary: "", url: "", image: "", imageAlt: "" },
      fields: [
        { key: "title", label: "Title", placeholder: "Headline" },
        { key: "date", label: "Date (pick)", placeholder: "YYYY-MM-DD", inputType: "date" },
        { key: "summary", label: "Summary", type: "textarea", rows: 2, fullWidth: true },
        { key: "url", label: "Link", placeholder: "join.html" },
        { key: "image", label: "Image upload (Optional)", type: "image", placeholder: "Click to upload announcement image", fullWidth: true },
        { key: "imageAlt", label: "Image alt", placeholder: "Alt text" }
      ]
    },
    gallery: {
      containerId: "gallery-list",
      path: ["gallery"],
      itemLabel: "Photo",
      previewKey: "src",
      layout: "grid-3",
      defaultItem: { src: "", caption: "", category: "" },
      fields: [
        { key: "src", label: "Image upload", type: "image", placeholder: "Click to upload photo", fullWidth: true },
        { key: "caption", label: "Caption", placeholder: "Caption" },
        { key: "category", label: "Category", placeholder: "Teams" }
      ]
    },
    quickLinks: {
      containerId: "quick-links-list",
      path: ["quickLinks"],
      itemLabel: "Quick link",
      defaultItem: { label: "", href: "" },
      fields: [
        { key: "label", label: "Label", placeholder: "Fixtures" },
        { key: "href", label: "URL", placeholder: "https://example.com" }
      ]
    },
    sponsors: {
      containerId: "sponsor-list",
      path: ["sponsors"],
      itemLabel: "Sponsor",
      previewKey: "logo",
      defaultItem: { name: "", logo: "", url: "" },
      fields: [
        { key: "name", label: "Name", placeholder: "Sponsor name" },
        { key: "logo", label: "Logo upload", type: "image", placeholder: "Click to upload logo", fullWidth: true },
        { key: "url", label: "Link", placeholder: "https://..." }
      ]
    },
    homePrograms: {
      containerId: "home-programs-list",
      path: ["pages", "home", "programs"],
      itemLabel: "Program",
      previewKey: "image",
      defaultItem: { title: "", badge: "", description: "", ctaLabel: "", ctaHref: "", image: "", imageAlt: "" },
      fields: [
        { key: "title", label: "Title", placeholder: "Program title" },
        { key: "badge", label: "Badge", placeholder: "Badge" },
        { key: "description", label: "Description", type: "textarea", rows: 3, fullWidth: true },
        { key: "ctaLabel", label: "CTA label", placeholder: "Learn more" },
        { key: "ctaHref", label: "CTA link", placeholder: "join.html#u8s" },
        { key: "image", label: "Image upload", type: "image", placeholder: "Click to upload program photo", fullWidth: true },
        { key: "imageAlt", label: "Image alt", placeholder: "Alt text" }
      ]
    },
    aboutAwards: {
      containerId: "about-awards-list",
      path: ["pages", "about", "awardsBlocks"],
      itemLabel: "Awards block",
      defaultItem: { tag: "", title: "", summary: "", bullets: [] },
      fields: [
        { key: "tag", label: "Tag", placeholder: "Awards" },
        { key: "title", label: "Title", placeholder: "Celebrating our people" },
        { key: "summary", label: "Summary", type: "textarea", rows: 2, fullWidth: true },
        { key: "bullets", label: "Bullets (one per line)", type: "textarea", list: true, rows: 3, fullWidth: true }
      ]
    },
    homeFeatured: {
      containerId: "home-featured-list",
      path: ["pages", "home", "featuredPhotos"],
      itemLabel: "Featured photo",
      previewKey: "src",
      defaultItem: { src: "", title: "", subtitle: "" },
      fields: [
        { key: "src", label: "Image upload", type: "image", placeholder: "Click to upload photo", fullWidth: true },
        { key: "title", label: "Title", placeholder: "Optional title" },
        { key: "subtitle", label: "Subtitle", placeholder: "Optional subtitle" }
      ]
    },
    aboutHistory: {
      containerId: "about-history-timeline-list",
      path: ["about", "historyTimeline"],
      itemLabel: "Timeline item",
      previewKey: "image",
      layout: "grid-2",
      defaultItem: { year: "", title: "", description: "", image: "", imageAlt: "" },
      fields: [
        { key: "year", label: "Era label", placeholder: "1960s" },
        { key: "title", label: "Title", placeholder: "Milestone" },
        { key: "description", label: "Description", type: "textarea", rows: 3, fullWidth: true },
        { key: "image", label: "Image upload", type: "image", placeholder: "Click to upload timeline image", fullWidth: true },
        { key: "imageAlt", label: "Image alt", placeholder: "Alt text" }
      ]
    },
    lifeMembers: {
      containerId: "about-life-members-list",
      path: ["about", "lifeMembers"],
      itemLabel: "Life member",
      previewKey: "photo",
      layout: "grid-2",
      defaultItem: { name: "", bio: "", photo: "" },
      fields: [
        { key: "name", label: "Name", placeholder: "Name" },
        { key: "photo", label: "Photo upload", type: "image", placeholder: "Click to upload portrait", fullWidth: true },
        { key: "bio", label: "Bio", type: "textarea", rows: 2, fullWidth: true }
      ]
    },
    spotlights: {
      containerId: "about-spotlights-list",
      path: ["about", "spotlights"],
      itemLabel: "Spotlight",
      previewKey: "photo",
      defaultItem: { name: "", role: "", blurb: "", photo: "", video: "", poster: "" },
      fields: [
        { key: "name", label: "Name", placeholder: "Name" },
        { key: "role", label: "Role", placeholder: "Role" },
        { key: "blurb", label: "Blurb", type: "textarea", rows: 2, fullWidth: true },
        { key: "photo", label: "Photo upload", type: "image", placeholder: "Click to upload spotlight photo", fullWidth: true },
        { key: "video", label: "Video URL", placeholder: "https://..." },
        { key: "poster", label: "Video poster upload", type: "image", placeholder: "Click to upload poster", fullWidth: true }
      ]
    },
    aboutFaqs: {
      containerId: "about-faqs-list",
      path: ["about", "faqs"],
      itemLabel: "FAQ",
      defaultItem: { question: "", answer: "" },
      fields: [
        { key: "question", label: "Question", placeholder: "Question" },
        { key: "answer", label: "Answer", type: "textarea", rows: 2, fullWidth: true }
      ]
    },
    coachesResources: {
      containerId: "coaches-resources-list",
      path: ["pages", "coaches", "resources"],
      itemLabel: "Resource",
      defaultItem: { title: "", description: "", ctaLabel: "", href: "" },
      fields: [
        { key: "title", label: "Title", placeholder: "Guide" },
        { key: "description", label: "Description", type: "textarea", rows: 2, fullWidth: true },
        { key: "ctaLabel", label: "CTA label", placeholder: "Open guide" },
        { key: "href", label: "Link", placeholder: "https://..." }
      ]
    },
    navLinks: {
      containerId: "nav-links-list",
      path: ["navigation", "links"],
      itemLabel: "Nav link",
      defaultItem: { label: "", href: "", key: "" },
      fields: [
        { key: "label", label: "Label", placeholder: "Home" },
        { key: "href", label: "URL", placeholder: "index.html" },
        { key: "key", label: "Key", placeholder: "home" }
      ]
    },
    footerQuickLinks: {
      containerId: "footer-quick-links-list",
      path: ["footer", "quickLinks"],
      itemLabel: "Footer link",
      defaultItem: { label: "", href: "" },
      fields: [
        { key: "label", label: "Label", placeholder: "Join the club" },
        { key: "href", label: "URL", placeholder: "join.html" }
      ]
    },
    footerConnectLinks: {
      containerId: "footer-connect-links-list",
      path: ["footer", "connectLinks"],
      itemLabel: "Connect link",
      defaultItem: { label: "", href: "" },
      fields: [
        { key: "label", label: "Label", placeholder: "Contact us" },
        { key: "href", label: "URL", placeholder: "about.html#contact" }
      ]
    }
  };

  const bindButtons = () => {
    const saveBtn = document.getElementById("save-admin");
    const resetBtn = document.getElementById("reset-admin");
    const exportBtn = document.getElementById("export-json");
    const importBtn = document.getElementById("import-json");
    const importInput = document.getElementById("import-json-input");

    if (saveBtn && !saveBtn.dataset.bound) {
      saveBtn.dataset.bound = "true";
      saveBtn.addEventListener("click", async () => {
        const result = saveSiteData(state.data);
        if (!result.ok) {
          showToast("Unable to save locally.", true);
          return;
        }
        state.dirty = false;
        if (confirmModal) {
          confirmModal.classList.remove("hidden");
          confirmModal.classList.add("flex");
        } else {
          showToast("Changes saved.");
        }
        try {
          const password = localStorage.getItem("adminPassword") || "";
          if (!password) {
            showToast("Missing admin password. Please re-login.", true);
            return;
          }
          const resp = await fetch(contentUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-Password": password
            },
            body: JSON.stringify(state.data)
          });
          if (!resp.ok) throw new Error("Remote save failed");
        } catch (err) {
          showToast("Saved locally. Remote save failed.", true);
        }
      });
    }

    if (confirmClose && !confirmClose.dataset.bound) {
      confirmClose.dataset.bound = "true";
      confirmClose.addEventListener("click", () => {
        confirmModal?.classList.add("hidden");
        confirmModal?.classList.remove("flex");
      });
    }

    if (resetBtn && !resetBtn.dataset.bound) {
      resetBtn.dataset.bound = "true";
      resetBtn.addEventListener("click", () => {
        resetSiteData();
        state.data = loadSiteData();
        state.dirty = false;
        renderAll();
        showToast("Changes reset.");
      });
    }

    if (exportBtn && !exportBtn.dataset.bound) {
      exportBtn.dataset.bound = "true";
      exportBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "site-content.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      });
    }

    if (importBtn && importInput && !importBtn.dataset.bound) {
      importBtn.dataset.bound = "true";
      importBtn.addEventListener("click", () => importInput.click());
      importInput.addEventListener("change", () => {
        const file = importInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result?.toString() || "{}");
            state.data = deepMerge(defaultSiteData, parsed);
            state.data.__hasOverrides = true;
            renderAll();
            markDirty();
            showToast("Content loaded. Save to apply.");
          } catch (err) {
            showToast("Invalid JSON file.", true);
          }
        };
        reader.readAsText(file);
        importInput.value = "";
      });
    }
  };

  const renderAll = () => {
    bindTextField("hero-headline", ["hero", "headline"]);
    bindTextField("hero-subhead", ["hero", "subhead"]);
    bindTextField("hero-primary-label", ["hero", "primaryCta", "label"]);
    bindTextField("hero-primary-href", ["hero", "primaryCta", "href"]);
    bindTextField("hero-secondary-label", ["hero", "secondaryCta", "label"]);
    bindTextField("hero-secondary-href", ["hero", "secondaryCta", "href"]);

    bindTextField("club-name", ["club", "name"]);
    bindTextField("club-short-name", ["club", "shortName"]);
    bindTextField("club-tagline", ["club", "tagline"]);

    bindTextField("nav-admin-label-field", ["navigation", "adminLabel"]);
    bindTextField("footer-tagline-field", ["footer", "tagline"]);
    bindTextField("footer-note-field", ["footer", "note"]);
    bindTextField("footer-quicklinks-title-field", ["footer", "quickLinksTitle"]);
    bindTextField("footer-connect-title-field", ["footer", "connectTitle"]);

    bindTextField("home-hero-kicker-field", ["pages", "home", "heroKicker"]);
    bindTextField("home-hero-title-field", ["pages", "home", "heroTitle"]);
    bindTextField("home-hero-highlight-field", ["pages", "home", "heroHighlight"]);
    bindTextField("home-programs-tag-field", ["pages", "home", "programsTag"]);
    bindTextField("home-programs-title-field", ["pages", "home", "programsTitle"]);
    bindTextField("about-awards-tag-field", ["pages", "about", "awardsTag"]);
    bindTextField("about-awards-title-field", ["pages", "about", "awardsTitle"]);
    bindTextField("about-awards-subtitle-field", ["pages", "about", "awardsSubtitle"]);
    bindTextField("home-gallery-tag-field", ["pages", "home", "galleryTag"]);
    bindTextField("home-gallery-title-field", ["pages", "home", "galleryTitle"]);
    bindTextField("home-gallery-subtitle-field", ["pages", "home", "gallerySubtitle"]);
    bindTextField("home-news-tag-field", ["pages", "home", "newsTag"]);
    bindTextField("home-news-title-field", ["pages", "home", "newsTitle"]);
    bindTextField("home-links-tag-field", ["pages", "home", "linksTag"]);
    bindTextField("home-links-title-field", ["pages", "home", "linksTitle"]);
    bindTextField("home-links-card-title-field", ["pages", "home", "linksCardTitle"]);
    bindTextField("home-links-card-text-field", ["pages", "home", "linksCardText"]);
    bindTextField("home-sponsors-tag-field", ["pages", "home", "sponsorsTag"]);
    bindTextField("home-sponsors-title-field", ["pages", "home", "sponsorsTitle"]);
    bindTextField("home-sponsors-desc-field", ["pages", "home", "sponsorsDescription"]);
    bindTextField("home-sponsors-cta-label", ["pages", "home", "sponsorsCtaLabel"]);
    bindTextField("home-sponsors-cta-href", ["pages", "home", "sponsorsCtaHref"]);
    bindTextField("home-cta-tag-field", ["pages", "home", "ctaTag"]);
    bindTextField("home-cta-title-field", ["pages", "home", "ctaTitle"]);
    bindTextField("home-cta-highlight-field", ["pages", "home", "ctaHighlight"]);
    bindTextField("home-cta-description-field", ["pages", "home", "ctaDescription"]);
    bindTextField("home-cta-primary-label-field", ["pages", "home", "ctaPrimary", "label"]);
    bindTextField("home-cta-primary-href-field", ["pages", "home", "ctaPrimary", "href"]);
    bindTextField("home-cta-secondary-label-field", ["pages", "home", "ctaSecondary", "label"]);
    bindTextField("home-cta-secondary-href-field", ["pages", "home", "ctaSecondary", "href"]);
    bindTextField("home-cta-tertiary-label-field", ["pages", "home", "ctaTertiary", "label"]);
    bindTextField("home-cta-tertiary-href-field", ["pages", "home", "ctaTertiary", "href"]);
    bindTextField("home-quote-text-field", ["pages", "home", "quote", "text"]);
    bindTextField("home-quote-attrib-field", ["pages", "home", "quote", "attribution"]);

    bindTextField("about-hero-tag-field", ["pages", "about", "heroTag"]);
    bindTextField("about-hero-title-field", ["pages", "about", "heroTitle"]);
    bindTextField("about-hero-highlight-field", ["pages", "about", "heroHighlight"]);
    bindTextField("about-history-title-field", ["pages", "about", "historyTitle"]);
    bindTextField("about-values-title-field", ["pages", "about", "valuesTitle"]);
    bindTextField("about-life-title-field", ["pages", "about", "lifeMembersTitle"]);
    bindTextField("about-intro-field", ["about", "intro"]);
    bindTextField("about-history-field", ["about", "history"]);
    bindTextField("about-values-field", ["about", "values"], { list: true });
    bindTextField("about-values-link-label-field", ["pages", "about", "valuesDocLabel"]);
    bindTextField("about-values-link-url-field", ["pages", "about", "valuesDocUrl"]);
    bindTextField("about-life-desc-field", ["pages", "about", "lifeDescription"]);
    bindTextField("about-contact-tag-field", ["pages", "about", "contactTag"]);
    bindTextField("about-contact-title-field", ["pages", "about", "contactTitle"]);
    bindTextField("about-contact-highlight-field", ["pages", "about", "contactHighlight"]);
    bindTextField("about-contact-cta-label", ["pages", "about", "contactCtaLabel"]);
    bindTextField("about-contact-cta-href", ["pages", "about", "contactCtaHref"]);
    bindTextField("about-contact-desc-field", ["pages", "about", "contactDescription"]);
    bindTextField("about-extra-tag-field", ["pages", "about", "extraTag"]);
    bindTextField("about-extra-title-field", ["pages", "about", "extraTitle"]);
    bindTextField("about-extra-text-field", ["pages", "about", "extraText"]);
    bindTextField("about-faq-tag-field", ["pages", "about", "faqTag"]);
    bindTextField("about-faq-title-field", ["pages", "about", "faqTitle"]);
    bindTextField("about-faq-subtitle-field", ["pages", "about", "faqSubtitle"]);
    bindTextField("about-highlight-video-field", ["about", "highlightVideo"]);
    bindTextField("about-highlight-alt-field", ["about", "highlightAlt"]);

    bindTextField("join-hero-tag-field", ["pages", "join", "heroTag"]);
    bindTextField("join-hero-title-field", ["pages", "join", "heroTitle"]);
    bindTextField("join-hero-highlight-field", ["pages", "join", "heroHighlight"]);
    bindTextField("join-hero-description-field", ["pages", "join", "heroDescription"]);
    bindTextField("join-quote-tag-field", ["pages", "join", "quoteTag"]);
    bindTextField("join-quote-attrib-field", ["pages", "join", "quoteAttribution"]);
    bindTextField("join-quote-text-field", ["pages", "join", "quoteText"]);
    bindTextField("join-feature-alt-field", ["pages", "join", "featureAlt"]);
    bindTextField("join-help-tag-field", ["pages", "join", "helpTag"]);
    bindTextField("join-help-title-field", ["pages", "join", "helpTitle"]);
    bindTextField("join-help-cta-label-field", ["pages", "join", "helpCtaLabel"]);
    bindTextField("join-help-cta-href-field", ["pages", "join", "helpCtaHref"]);
    bindTextField("join-help-text-field", ["pages", "join", "helpText"]);
    bindTextField("join-signup-label-field", ["pages", "join", "signUpLabel"]);
    bindTextField("join-signup-href-field", ["pages", "join", "signUpHref"]);

    bindTextField("training-hero-tag-field", ["pages", "training", "heroTag"]);
    bindTextField("training-hero-title-field", ["pages", "training", "heroTitle"]);
    bindTextField("training-hero-highlight-field", ["pages", "training", "heroHighlight"]);
    bindTextField("training-hero-description-field", ["pages", "training", "heroDescription"]);
    bindTextField("training-season-tag-field", ["pages", "training", "seasonTag"]);
    bindTextField("training-season-title-field", ["pages", "training", "seasonTitle"]);
    bindTextField("training-season-description-field", ["pages", "training", "seasonDescription"]);
    bindTextField("training-schedule-tag-field", ["pages", "training", "scheduleTag"]);
    bindTextField("training-schedule-title-field", ["pages", "training", "scheduleTitle"]);
    bindTextField("training-schedule-description-field", ["pages", "training", "scheduleDescription"]);
    bindTextField("training-schedule-cta-label-field", ["pages", "training", "scheduleCtaLabel"]);
    bindTextField("training-schedule-cta-href-field", ["pages", "training", "scheduleCtaHref"]);
    bindTextField("training-locations-tag-field", ["pages", "training", "locationsTag"]);
    bindTextField("training-locations-title-field", ["pages", "training", "locationsTitle"]);
    bindTextField("training-locations-field", ["pages", "training", "locations"], { list: true });

    bindTextField("gallery-hero-tag-field", ["pages", "gallery", "heroTag"]);
    bindTextField("gallery-hero-title-field", ["pages", "gallery", "heroTitle"]);
    bindTextField("gallery-hero-highlight-field", ["pages", "gallery", "heroHighlight"]);
    bindTextField("gallery-hero-description-field", ["pages", "gallery", "heroDescription"]);
    bindTextField("gallery-all-label-field", ["pages", "gallery", "allLabel"]);
    bindTextField("gallery-empty-title-field", ["pages", "gallery", "emptyTitle"]);
    bindTextField("gallery-empty-desc-field", ["pages", "gallery", "emptyDescription"]);

    bindTextField("sponsors-hero-tag-field", ["pages", "sponsors", "heroTag"]);
    bindTextField("sponsors-hero-title-field", ["pages", "sponsors", "heroTitle"]);
    bindTextField("sponsors-hero-highlight-field", ["pages", "sponsors", "heroHighlight"]);
    bindTextField("sponsors-hero-desc-field", ["pages", "sponsors", "heroDescription"]);
    bindTextField("sponsors-cta-tag-field", ["pages", "sponsors", "ctaTag"]);
    bindTextField("sponsors-cta-title-field", ["pages", "sponsors", "ctaTitle"]);
    bindTextField("sponsors-cta-highlight-field", ["pages", "sponsors", "ctaHighlight"]);
    bindTextField("sponsors-cta-label-field", ["pages", "sponsors", "ctaLabel"]);
    bindTextField("sponsors-cta-href-field", ["pages", "sponsors", "ctaHref"]);
    bindTextField("sponsors-cta-desc-field", ["pages", "sponsors", "ctaDescription"]);
    bindTextField("sponsors-features-field", ["pages", "sponsors", "features"], { list: true });

    bindTextField("merch-hero-tag-field", ["pages", "merch", "heroTag"]);
    bindTextField("merch-hero-title-field", ["pages", "merch", "heroTitle"]);
    bindTextField("merch-hero-highlight-field", ["pages", "merch", "heroHighlight"]);
    bindTextField("merch-store-tag-field", ["pages", "merch", "storeTag"]);
    bindTextField("merch-store-title-field", ["pages", "merch", "storeTitle"]);
    bindTextField("merch-store-highlight-field", ["pages", "merch", "storeHighlight"]);
    bindTextField("merch-blurb-field", ["merch", "blurb"]);
    bindTextField("merch-store-description-field", ["pages", "merch", "storeDescription"]);
    bindTextField("merch-store-field", ["merch", "storeUrl"]);
    bindTextField("merch-pillars-field", ["pages", "merch", "pillars"], { list: true });
    bindTextField("merch-cta-label-field", ["pages", "merch", "ctaLabel"]);
    bindTextField("merch-supplier-tag-field", ["pages", "merch", "supplierTag"]);
    bindTextField("merch-supplier-name-field", ["merch", "supplier", "name"]);
    bindTextField("merch-supplier-url-field", ["merch", "supplier", "url"]);
    bindTextField("merch-supplier-note-field", ["merch", "supplierNote"]);
    bindTextField("merch-intro-field", ["merch", "intro"]);
    bindTextField("merch-essentials-tag-field", ["pages", "merch", "essentialsTag"]);
    bindTextField("merch-essentials-title-field", ["pages", "merch", "essentialsTitle"]);
    bindTextField("merch-essentials-field", ["merch", "essentials"], { list: true });
    bindTextField("merch-important-tag-field", ["pages", "merch", "importantTag"]);
    bindTextField("merch-important-title-field", ["pages", "merch", "importantTitle"]);
    bindTextField("merch-important-text-field", ["merch", "importantText"]);

    bindTextField("coaches-hero-tag-field", ["pages", "coaches", "heroTag"]);
    bindTextField("coaches-hero-title-field", ["pages", "coaches", "heroTitle"]);
    bindTextField("coaches-hero-highlight-field", ["pages", "coaches", "heroHighlight"]);
    bindTextField("coaches-blurb-field", ["coaches", "blurb"]);
    bindTextField("coaches-cta-tag-field", ["pages", "coaches", "ctaTag"]);
    bindTextField("coaches-cta-title-field", ["pages", "coaches", "ctaTitle"]);
    bindTextField("coaches-cta-highlight-field", ["pages", "coaches", "ctaHighlight"]);
    bindTextField("coaches-cta-label-field", ["pages", "coaches", "ctaLabel"]);
    bindTextField("coaches-cta-href-field", ["pages", "coaches", "ctaHref"]);
    bindTextField("coaches-cta-description-field", ["pages", "coaches", "ctaDescription"]);

    initDropdown("gallery-order-field", ["pages", "gallery", "orderMode"]);

    initListEditor(listConfigs.news);
    initListEditor(listConfigs.gallery);
    initListEditor(listConfigs.quickLinks);
    initListEditor(listConfigs.sponsors);
    initListEditor(listConfigs.homePrograms);
    initListEditor(listConfigs.aboutAwards);
    initListEditor(listConfigs.homeFeatured);
    initListEditor(listConfigs.aboutHistory);
    initListEditor(listConfigs.lifeMembers);
    initListEditor(listConfigs.spotlights);
    initListEditor(listConfigs.aboutFaqs);
    initListEditor(listConfigs.coachesResources);
    initListEditor(listConfigs.navLinks);
    initListEditor(listConfigs.footerQuickLinks);
    initListEditor(listConfigs.footerConnectLinks);

    initJoinStreamsEditor();
    initImageFields();
    initBulkGalleryUpload();
    ensureFieldLabels();
    initAdminTabs();
  };

  const init = () => {
    state.data = loadSiteData();
    renderAll();
    bindButtons();
  };

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("admin:unlocked", () => {
    state.data = loadSiteData();
    renderAll();
  });
  window.addEventListener("sitecontent:updated", () => {
    state.data = loadSiteData();
    renderAll();
  });
})();
