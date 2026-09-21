var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
import { DurableObject } from "cloudflare:workers";
var MyDurableObject = class extends DurableObject {
  static {
    __name(this, "MyDurableObject");
  }
  async sayHello(name) {
    return `Hello, ${name}!`;
  }
};
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Password"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const CONTENT_KEY = "site-content";
    if (request.method === "GET" && url.pathname === "/content") {
      const raw = await env.CONTENT_KV.get(CONTENT_KEY);
      const content = raw ? JSON.parse(raw) : { sections: [] };
      return new Response(JSON.stringify(content), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (request.method === "PUT" && url.pathname === "/content") {
      const pw = request.headers.get("X-Password") || "";
      if (!pw || pw !== env.ADMIN_PASSWORD) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
      let data;
      try {
        data = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
      }
      if (!env.CONTENT_R2 || !env.R2_PUBLIC_BASE_URL) {
        return new Response("Missing R2 configuration", { status: 500, headers: corsHeaders });
      }
      const processed = await replaceInlineUploadsWithR2(data, env);
      await env.CONTENT_KV.put(CONTENT_KEY, JSON.stringify(processed));
      // Hand back the processed content so the admin can adopt the R2 URLs
      // instead of keeping the (much larger) inline base64 in memory.
      return new Response(JSON.stringify(processed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (request.method === "POST" && url.pathname === "/transfer") {
      const pw = request.headers.get("X-Password") || "";
      if (!pw || pw !== env.ADMIN_PASSWORD) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
      let data;
      try {
        data = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
      }
      if (!env.CONTENT_R2 || !env.R2_PUBLIC_BASE_URL) {
        return new Response("Missing R2 configuration", { status: 500, headers: corsHeaders });
      }
      const processed = await replaceInlineUploadsWithR2(data, env);
      return new Response(JSON.stringify(processed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (request.method === "POST" && url.pathname === "/auth") {
      let data;
      try {
        data = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
      }
      if (data.password !== env.ADMIN_PASSWORD) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
      return new Response("OK", { status: 200, headers: corsHeaders });
    }
    if (request.method === "GET" && url.pathname === "/content") {
      const raw = await env.CONTENT_KV.get("site-content");
      const content = raw ? JSON.parse(raw) : {
        hero: {
          title: "My Website",
          subtitle: "Edit this later"
        },
        about: {
          text: "Initial site content goes here."
        }
      };
      return new Response(JSON.stringify(content), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    if (request.method === "POST" && url.pathname === "/contact") {
      let data;
      try {
        data = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
      }
      const name = String(data?.name ?? "").trim();
      const email = String(data?.email ?? "").trim();
      const message = String(data?.message ?? "").trim();
      if (!name || !email || !message) {
        return new Response("Missing fields", { status: 400, headers: corsHeaders });
      }
      if (message.length > 4e3) {
        return new Response("Message too long", { status: 400, headers: corsHeaders });
      }
      if (email.includes("\n") || email.includes("\r")) {
        return new Response("Invalid email", { status: 400, headers: corsHeaders });
      }
      await sendEmail(env, {
        to: "westbasketballclubnewcastle@gmail.com",
        subject: "New contact form submission",
        content: `Name: ${name}
Email: ${email}

${message}`
      });
      return new Response("OK", { headers: corsHeaders });
    }
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
};
async function sendEmail(env, { to, subject, content }) {
  if (!env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY secret");
  }
  const from = "West Basketball Website <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: content
      // Optional: set reply-to so you can reply directly to the sender
      // reply_to: email,
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Email failed (${res.status}): ${text}`);
  }
}
__name(sendEmail, "sendEmail");
var UPLOAD_DATA_URL = /^data:(image\/[a-z0-9.+-]+|application\/pdf);base64,(.+)$/i;
var UPLOAD_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf"
};
async function replaceInlineUploadsWithR2(value, env) {
  if (Array.isArray(value)) {
    const entries = await Promise.all(value.map((item) => replaceInlineUploadsWithR2(item, env)));
    return entries;
  }
  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key2, item]) => [key2, await replaceInlineUploadsWithR2(item, env)])
    );
    return Object.fromEntries(entries);
  }
  if (typeof value !== "string") return value;
  const match = value.match(UPLOAD_DATA_URL);
  if (!match) return value;
  const mime = match[1].toLowerCase();
  const base64 = match[2];
  const ext = UPLOAD_EXTENSIONS[mime] || "bin";
  const bytes = decodeBase64(base64);
  const hash = await digestHex(bytes);
  const key = `uploads/${hash}.${ext}`;
  await env.CONTENT_R2.put(key, bytes, {
    httpMetadata: { contentType: mime }
  });
  return `${env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;
}
__name(replaceInlineUploadsWithR2, "replaceInlineUploadsWithR2");
function decodeBase64(data) {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(decodeBase64, "decodeBase64");
async function digestHex(bytes) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(digestHex, "digestHex");
export {
  MyDurableObject,
  index_default as default
};
//# sourceMappingURL=index.js.map
