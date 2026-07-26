import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("home page renders map shell and navbar", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = (await response.text()).replaceAll("<!-- -->", "");
  assert.match(html, /<title>Where I&#x27;ve Been<\/title>/i);
  assert.match(html, /Where I&#x27;ve Been/);
  assert.match(html, /Haritadaki pinlerden/);
  assert.match(html, /Ana Sayfa/);
  assert.match(html, /Mekan Rehberi/);
  assert.match(html, /Topluluk/);
  assert.match(html, /Giriş Yap/);
  assert.doesNotMatch(html, /Nereleri Gezdim|codex-preview/);
});

test("place guide renders place list and comments", async () => {
  const response = await render("/mekanlar/eskisehir");
  assert.equal(response.status, 200);

  const html = (await response.text()).replaceAll("<!-- -->", "");
  assert.match(html, /Mekan Rehberi/);
  assert.match(html, /Odunpazar/);
  assert.match(html, /Yorumlan/);
  assert.match(html, /Haritaya/);
  assert.match(html, /giriş yapmalı/);
});

test("community page renders city discussions", async () => {
  const response = await render("/topluluk");
  assert.equal(response.status, 200);

  const html = (await response.text()).replaceAll("<!-- -->", "");
  assert.match(html, /Dünya genelinde gezgin sohbetleri/);
  assert.match(html, /sohbetleri/);
  assert.match(html, /Yeni sohbet/);
  assert.match(html, /Sohbet başlatmak için giriş/);
});

test("contact page renders admin contact form", async () => {
  const response = await render("/iletisim");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /destek talepleri/);
  assert.match(html, /Admin kutusu/);
  assert.match(html, /giriş yapmalısın/);
});

test("auth pages and profile render", async () => {
  const giris = await render("/giris");
  const kayit = await render("/kayit");
  const profil = await render("/profil");

  assert.equal(giris.status, 200);
  assert.equal(kayit.status, 200);
  assert.equal(profil.status, 200);

  assert.match(await giris.text(), /Hesabına giriş yap/);
  assert.match(await kayit.text(), /Yeni hesap oluştur/);
  assert.match(await profil.text(), /Profilini görmek için giriş/);
});

test("admin page renders restricted panel", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Yönetici Paneli/);
  assert.match(html, /sadece yöneticiler/);
});
