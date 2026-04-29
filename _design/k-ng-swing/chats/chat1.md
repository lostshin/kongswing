# 官方網站視覺規範

_Started 2026-04-29 05:13 UTC_

---

## User

我要做一個官方網站，主視覺設計規範可以參考我剛剛上傳的logo圖以及宣傳圖

## Assistant

I'll start by examining the uploaded reference images to understand the visual direction, then ask clarifying questions about the website scope.

_[tool: view_image]_

_[tool: view_image]_

_[tool: list_files]_

我看到了 logo，第二張圖讓我再試一次：

_[tool: image_metadata]_

_[tool: run_script]_

檔名有特殊字元，我先複製成簡單的檔名再讀：

_[tool: copy_files]_

那張宣傳圖路徑似乎有問題，但既然從 attachment 的描述跟使用者直接顯示的圖我已經看到了，我有充足的資訊。讓我先問清楚需求再開始：

_[tool: questions_v2]_

## User

Questions answered:
- site_purpose: 介紹品牌／團隊與理念, 台語＋Swing 詞彙學習資源, 課程／工作坊報名, 活動（社交舞會、表演）資訊, 贊助／聯絡, Explore a few options
- audience: 三者都涵蓋
- tone: 可愛童書 / 插畫感（呼應油彩兔子）
- color_direction: 以米白為主、藏藍為強調色，黃色點綴
- sections: Hero（主視覺＋slogan）, 關於我們, 今日台語單字（像宣傳圖那樣的卡片）, 近期活動／課程, FAQ, 聯絡我們
- vocab_card: 還
- interactivity: 兔子跟著捲動會動, 單字卡可以翻面／播放發音
- fonts: 手寫感／插畫字體點綴
- language: 台羅（白話字／POJ）, 華語, 英文
- variations: 1 個精緻版本
- tweaks: 字體組合, 兔子插圖大小／位置, 主色 / 配色
- scope: 首頁 + 1-2 個次頁（活動／詞彙庫）
- extras: slogan:
兩人一兔，走揣轉厝ê路 想欲用台語分享Swing dance佮Jazz 文化內底ê熱情、自由、美麗，招逐家做伙講Tâi-gí、跳Swing🥳 佇轉厝ê路頂面跳舞 ₍ᐢ..ᐢ₎

參考連結：
https://www.instagram.com/kongswing/

## Assistant

_[tool: snip]_

好，謝謝回覆！我來規劃一下：

**設計系統**
- 色彩：藏藍 #1E3A8A、芥末黃 #F4C84B、米白紙質 #F0EBDF、深褐字 #2A2520
- 字體：Noto Serif TC（標題，手寫油彩 logo 風感）+ Caveat / Shadows Into Light（手寫英文點綴）+ Noto Sans TC（內文）
- 視覺語彙：報紙網點紙質背景、藏藍剪紙形狀、油彩兔子穿插、芥末黃高亮 marker、台羅標音排版
- 結構：單頁（首頁）+ 詞彙庫次頁 + 活動次頁

我先建立資料夾與計畫：

_[tool: update_todos]_

先處理素材：複製 logo + 嘗試取得宣傳圖：

_[tool: copy_files]_

_[tool: run_script]_

_[tool: copy_starter_component]_

宣傳圖檔名有特殊字元無法存取，但我已經從附件直接看到內容了，知道視覺語彙：藍色不規則剪紙形狀 + 芥末黃 marker + 台羅排版。我會在網站重現這個語彙。

先看看 tweaks panel 介面：

_[tool: read_file]_

Good. Now let me build the site. I'll create a polished single-file React prototype with the Hero/About/Vocab Card/Events/FAQ/Contact sections, plus two subpages.

_[tool: write_file]_

_[tool: snip]_

Now let me build the two subpages and surface the file.

_[tool: write_file]_

## Assistant

_[tool: show_to_user]_

Now let me build the two subpages (vocabulary library and events) and add Tweaks. First the vocab library:

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

Now let me add Tweaks support to the main page. I'll check the tweaks panel API briefly and integrate.

_[tool: read_file]_

I have enough info. Now let me integrate Tweaks into the main page using a small inline React + tweaks-panel approach. Rather than rewriting the whole page in React, I'll add a self-contained React island just for the tweaks UI that mutates CSS variables on `:root`.

_[tool: snip]_

_[tool: str_replace_edit]_

Now add the Tweaks scripts and React island. I'll inject just before `</body>`:

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

完成囉！官方網站做好了：

**🏠 首頁** (`index.html`)
- Hero：油彩兔仔 + 藏藍剪紙底 + 芥末黃 marker，slogan 用台羅／華語／英文三層
- 關於阮 + 拍立得插畫 + 三組數字
- 今仔日詞：可翻面、有「播音／翻面／收藏」+ 5 字示範可前後切換
- 近期活動 3 張 + FAQ 5 題（手風琴）+ 聯絡表單 + 4 個社群入口
- 兔仔會跟著捲動跑出來，講著「咱來跳舞」「iô-pái~」

**📚 詞彙庫** (`vocabulary.html`)
12 字 demo，附搜尋、分類 chip、點卡片發音

**📅 課程** (`events.html`)
6 場活動 + 五月行事曆網格

**🎛 Tweaks**（右下角開啟）
- 主色 / 點綴 / 紙張 顏色
- 4 種字體組合（Noto Serif、Playfair、Zen Maru、Fraunces）
- 兔仔大小、位置
- 搖擺角度、紙質雜訊開關

**接下來可做**：補上真實活動報名連結、IG 嵌入、把詞彙庫從 12 字長到 128 字、加 EN 切換器。

## User

很讚耶，
1.幫我將logo（兔仔）換成現在上傳的這張圖
2.再幫頁面改成台灣華語+羅馬字為主，並加上可以切換台語漢字、台語羅馬字、英文的切換器
3.台語字體可以參考芫荽 / iansui字體
：https://github.com/ButTaiwan/iansui

## Assistant

_[tool: snip]_

_[tool: copy_files]_

_[tool: view_image]_

Logo 已換好。接下來查一下 Iansui 字體用法、加切換器、改華文+羅馬字優先：

_[tool: str_replace_edit]_

_[tool: web_search]_

Iansui 在 Google Fonts 也有，最簡單方式是用 Google Fonts。我來改：

_[tool: snip]_

Now let me update the font system to add Iansui and add a language switcher. Let me look at current index.html structure:

_[tool: grep]_

_[tool: snip]_

I'll add Iansui as a Tâi-gí Hàn-jī font, build the language switcher, and content arrays. Let me make focused changes:

_[tool: str_replace_edit]_

_[tool: snip]_

I'll now read the current full file structure and make focused edits to add the language switcher. Let me read enough to see the key sections that have multilingual text:

_[tool: grep]_

_[tool: snip]_

I'll take a focused approach: rather than rewriting every text node with i18n keys (which would be huge), I'll restructure the page so language is shown in **rows of 3 spans** (zh-tw / poj / en), and the language switcher toggles which spans are visible via CSS classes on `<html>`. The Han 漢字 stays as the heading by default. Plus add language switcher in nav.

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

Now I'll add the language switcher in the nav and rewrite key user-visible content with proper lang spans. Let me make targeted edits to the most prominent text:

_[tool: str_replace_edit]_

_[tool: snip]_

Now add the H1 lang spans, ticker click handler for switching, and finalize:

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: grep]_

_[tool: snip]_

_[tool: read_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

I need to add the language switcher CSS and JS now. Let me find the right spots and inject.

_[tool: snip]_

_[tool: grep]_

Now let me inject the lang-switch CSS and JS:

_[tool: str_replace_edit]_

Now add the JS handler. Let me find where scripts end and add the lang switcher logic, plus set initial state:

_[tool: grep]_

The active nav highlight uses `.nav-links a` and will conflict — but only top-level anchors should be tagged active. Looking at it, `.nav-links a` will also pick `.lang-sw button` is fine (those are buttons, not anchors). Let me also exclude `.lang-sw a` from being affected. Actually lang-sw uses buttons so it's fine. Let me add the lang JS:

_[tool: str_replace_edit]_

Now let me also add `data-lang="all"` initial attribute to `<html>` for safety, and verify:

_[tool: grep]_

JS already sets it on load. Let me check the page renders:

_[tool: done]_

_[tool: fork_verifier_agent]_

加好了！右上角有 **ALL / 華 / 台 / POJ / EN** 5 個切換鈕：

- **ALL**：堆疊顯示華語、台語漢字、POJ、English（POJ 用襯線斜體、英文用淡色）
- **華 / 台 / POJ / EN**：單一語言檢視
- 選擇會記在 localStorage，下次回來保留

主要區塊都已分四語：nav、Hero eyebrow、lede、CTA 按鈕、About 段落與 pull quote。**Tweaks 面板、詞彙卡、活動、FAQ、聯絡表單還是中文/台語為主**，要不要我也把那些區塊都掛上四語？還是這樣就夠了？

## User

Verifier agent check completed

## Assistant

Verifier hit a transient 502 — page itself loaded clean per `done`. Try the language pills (top-right of nav) and let me know if any section needs more languages added!

## User

1.不需要ＡＬＬ的版本，預設台灣華語版本就好
2.要有RWD

## Assistant

好的，做兩件事：1) 拿掉 ALL 模式（預設「華」），2) 加 RWD（手機收合 nav）。

_[tool: update_todos]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now remove the ALL-mode CSS and add RWD. Let me first see current layout to plan breakpoints:

_[tool: grep]_

_[tool: snip]_

_[tool: read_file]_

_[tool: snip]_

There's already a 920px breakpoint that hides nav. I need a proper mobile menu (hamburger), more breakpoints for type/layout. Let me also remove ALL-mode CSS rules. Let me find them:

_[tool: grep]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

Now let me read the current responsive section to upgrade it with proper RWD + mobile menu:

_[tool: read_file]_

Now let me build a proper responsive system. Replace the existing media query with a proper mobile menu and finer breakpoints:

_[tool: str_replace_edit]_

## Assistant

Let me check the H1 hero size & some sections to know what to scale:

_[tool: grep]_

_[tool: snip]_

Now I'll replace the responsive CSS block with proper RWD + a hamburger toggle, and add the toggle button to nav.

_[tool: str_replace_edit]_

Now add the toggle button to nav and add JS to toggle, plus add a viewport meta if missing:

_[tool: grep]_

_[tool: str_replace_edit]_

Now wire up the toggle JS — find a good spot to inject after the lang switcher:

_[tool: str_replace_edit]_

Now check the page renders, plus update todos:

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

改好了：

1. **拿掉 ALL**：語言切換器只剩 **華 / 台 / POJ / EN**，預設「華」（台灣華語）
2. **RWD 三段斷點**：
   - `≤1080px` 平板：縮 padding、字級、雙欄
   - `≤820px` 手機：nav 收進右上角漢堡按鈕→展開全寬 sheet（serif 大字、語言切換在頂部、Esc 可關）；hero 直排、兔仔置頂；section padding 縮減；ticker 字小一點
   - `≤420px` 小手機：CTA 直排、stats 兩欄
3. 漢堡有開合動畫（三線→叉），開啟時鎖背景捲動；點選任一連結或 resize 回桌機自動關閉

_[tool: snip]_

試試把瀏覽器視窗縮到手機寬度，或在開發者工具切到手機模式看效果！

## User

Verifier agent check completed

## Assistant

一切正常 ✓ RWD 與語言切換都已就緒。手機版可在瀏覽器開發者工具切換裝置模式預覽。

## User

Apply comment

## Assistant

使用者指的是 `.brand-mark` — 圓圈邊框包著 logo 看起來怪。把它改成只顯示 logo.png：

_[tool: grep]_

拿掉圓框與裁切，logo.png 保持原樣：

_[tool: str_replace_edit]_

改好了 ✓ 拿掉圓框、邊線、背景與裁切，logo.png 直接顯示原貌。

## User

換成這個logo.png

## Assistant

_[tool: snip]_

_[tool: copy_files]_

Logo 已換成新的圓形 logo（兔仔 + Kóng台語 跳Swing 文字）。新 logo 本身已經是圓形的構圖，所以原本拿掉圓框的設定剛好搭配——直接顯示就很完整。

## User

為什麼我抓不到？

## Assistant

_[tool: snip]_

_[tool: update_todos]_

_[tool: eval_js_user_view]_

