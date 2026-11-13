(() => {
  "use strict";

  const safeStorage = (() => {
    try { const test = "__nexus_test__"; window.localStorage.setItem(test, "1"); window.localStorage.removeItem(test); return window.localStorage; }
    catch (_) { const memory = new Map(); return { getItem:key => memory.has(key) ? memory.get(key) : null, setItem:(key,value) => memory.set(key,String(value)), removeItem:key => memory.delete(key), clear:() => memory.clear() }; }
  })();

  const APP_VERSION = "1.20.0";

  let tools = [
    {
      id: "trd-31",
      name: "Tape Reel Designer 3D",
      short: "Tape Reel Designer",
      category: "3D DESIGN",
      categoryKey: "design",
      description: "テープリールの巻径・必要長・配置を設計し、機構を立体的に確認するツール。",
      image: "assets/tools/tape-reel.svg",
      bg: "#d51d6d",
      tag: "#f0568f",
      files: 12,
      updated: "2時間前",
      status: "READY",
      version: "2.1.0",
      recentFiles: ["reel_design_v12.blend", "test_winding_v7.blend", "reel_param_0529.json"]
    },
    {
      id: "ptd-50",
      name: "Periodic Tape Designer",
      short: "Periodic Tape",
      category: "DATA / PROCESS",
      categoryKey: "process",
      description: "周期構造テープの送り、形状、周期長を設計して工程を可視化するツール。",
      image: "assets/tools/periodic-tape.svg",
      bg: "#0f6e86",
      tag: "#43c4d0",
      files: 8,
      updated: "昨日",
      status: "READY",
      version: "1.8.2",
      recentFiles: ["periodic_shape_469mm.json", "roller_profile.step", "stroke_plan.csv"]
    },
    {
      id: "rps-09",
      name: "Radia to Python Studio",
      short: "Radia Studio",
      category: "SIMULATION",
      categoryKey: "analysis",
      description: "磁石配列と磁場線を確認しながら、Radia解析コードをPythonへ展開するツール。",
      image: "assets/tools/radia-studio.svg",
      bg: "#d59d00",
      tag: "#f3bf31",
      files: 16,
      updated: "3日前",
      status: "READY",
      version: "0.9.4",
      recentFiles: ["undulator_model.py", "field_scan_0624.csv", "03_B_vector.pos"]
    },
    {
      id: "mdi-10",
      name: "Model Interpreter",
      short: "Model Interpreter",
      category: "AI / VISUAL",
      categoryKey: "ai",
      description: "3Dモデル、画像、解析結果を読み解き、構造や特徴を視覚的に整理するツール。",
      image: "assets/tools/model-interpreter.svg",
      bg: "#c8c2b8",
      tag: "#b1aaa1",
      files: 9,
      updated: "5日前",
      status: "PROTOTYPE",
      version: "0.7.1",
      recentFiles: ["coil_section.glb", "inspection_notes.md", "shape_features.json"]
    },
    {
      id: "ptr-01",
      name: "Paper Translator",
      short: "Paper Translator",
      category: "DOCUMENT",
      categoryKey: "document",
      description: "論文・仕様書・会議資料を構造を保ったまま翻訳し、研究メモへつなげるツール。",
      image: "assets/tools/paper-translator.svg",
      bg: "#e16c36",
      tag: "#ff925e",
      files: 21,
      updated: "1週間前",
      status: "DEVELOPMENT",
      version: "0.5.0",
      recentFiles: ["HTS_paper_ja.md", "meeting_translation.docx", "terms_dictionary.json"]
    },
    {
      id: "ws-control",
      name: "Winding System Control",
      short: "WS Control",
      category: "CONTROL",
      categoryKey: "control",
      description: "巻線装置のモータ、押込み、供給量を管理する制御インターフェース。",
      image: "assets/tools/ws-control.svg",
      bg: "#2b7fa4",
      tag: "#56b6dc",
      files: 6,
      updated: "6日前",
      status: "HARDWARE",
      version: "1.2.6",
      recentFiles: ["stage1_config.yaml", "motor_profile.json", "device_log.txt"]
    }
  ];

  let projects = [
    { id: "hts", name: "HTS Undulator Project", subtitle: "巻線・磁場解析・制御", progress: 72, color: "#2fb7cb", icon: "◎" },
    { id: "particle", name: "Particle Tracking Study", subtitle: "イベントカメラ・AI", progress: 45, color: "#ec2f79", icon: "↻" },
    { id: "robot", name: "Modular Robot Development", subtitle: "GNN・構造探索", progress: 31, color: "#f3bf31", icon: "◇" },
    { id: "fusion", name: "Fusion Magnet Research", subtitle: "磁場・超伝導", progress: 18, color: "#39a879", icon: "∞" }
  ];

  let notes = [
    { id: "n1", title: "実験アイデア：磁性体テープの応答", body: "磁場強度を変化させた時の挙動を記録し、周期形状との関係を比較する。", time: "10:42", pinned: true, color: "#6fd1d8", tag: "EXPERIMENT" },
    { id: "n2", title: "Radia Studio メモ", body: "線源モデルの境界条件とGmshへの表示方法を確認する。", time: "昨日", pinned: false, color: "#f7ce51", tag: "ANALYSIS" },
    { id: "n3", title: "文献メモ：Nature 2024", body: "テープ材料の新しい合成手法と既存手法の比較。", time: "2日前", pinned: false, color: "#f4a3c4", tag: "PAPER" },
    { id: "n4", title: "次回ミーティングで話すこと", body: "データ共有フロー、巻線工程の安全確認、測定プローブの仕様。", time: "3日前", pinned: false, color: "#c6b8ee", tag: "MEETING" },
    { id: "n5", title: "UI構想：動きが内容を説明する", body: "発光だけでなく、リールなら回る、テープなら送られる。機能そのものを動きにする。", time: "今日", pinned: true, color: "#f4b56a", tag: "DESIGN" }
  ];

  const navItems = [
    ["home", "⌂", "ホーム"],
    ["tools", "⚒", "ツール"],
    ["projects", "▣", "プロジェクト"],
    ["notes", "▤", "メモ"],
    ["guide", "?", "ガイド"],
    ["settings", "⚙", "設定"]
  ];

  const quickActions = [
    ["最近のツール", "↗", "#df2770", "recent-tool"],
    ["横断検索", "⌕", "#25a8bd", "search"],
    ["新規メモ", "✎", "#f0b50f", "new-note"],
    ["資料を登録", "＋", "#df2770", "add-resource"],
    ["プロジェクト", "▣", "#25a8bd", "open-active-project"],
    ["バックアップ", "⇩", "#77716b", "create-backup"]
  ];

  const heroSlides = [
    { ring: ["MAKE", "TEST", "LEARN"], accent: "#ec2f79", message: "試して、壊して、また組み直す。" },
    { ring: ["IDEAS", "IN", "MOTION"], accent: "#2fb7cb", message: "問いを動かし、道具へ変える。" },
    { ring: ["THINK", "BUILD", "SHARE"], accent: "#f3bf31", message: "研究を一人の画面で終わらせない。" }
  ];

  const genericContent = {
    shared: {
      number: "04", kicker: "SHARED SPACE", title: "SHARED", description: "ファイル、リンク、判断の経緯をプロジェクト単位で共有する場所。",
      cards: [["HANDOFF", "次の人が迷わない引継ぎを残す。", "#2fb7cb"], ["REVIEW", "成果物にコメントと判断を重ねる。", "#ec2f79"], ["LIBRARY", "共通資料とテンプレートをまとめる。", "#f3bf31"]]
    },
    team: {
      number: "05", kicker: "PEOPLE & ROLES", title: "TEAM", description: "誰が、何を知り、どの作業を担当しているかを見える形にする。",
      cards: [["PEOPLE", "研究者、協力者、レビュー担当。", "#ec2f79"], ["ROLES", "装置・解析・資料の担当範囲。", "#2fb7cb"], ["RHYTHM", "会議、実験、レビューの周期。", "#39a879"]]
    },
    settings: {
      number: "06", kicker: "WORKSPACE CONTROL", title: "SETTINGS", description: "表示、動き、カテゴリ、起動方法を自分の研究環境に合わせる。",
      cards: [["MOTION", "動的UIの強さと低負荷モード。", "#2fb7cb"], ["IDENTITY", "ツール名、色、プレビューの編集。", "#ec2f79"], ["DATA", "ローカル保存とバックアップ方針。", "#f3bf31"]]
    }
  };

  const legacyIntroSetting = safeStorage.getItem("nexusShowIntro");
  const storedIntroModeRaw = String(safeStorage.getItem("nexusIntroMode") || "").toLowerCase();
  const storedIntroMode = ["full", "quick", "off"].includes(storedIntroModeRaw)
    ? storedIntroModeRaw
    : legacyIntroSetting === "false" ? "off" : null;
  const introSeenCount = Math.max(0, Number(safeStorage.getItem("nexusIntroSeenCount") || 0));
  const startupIntroMode = storedIntroMode || (introSeenCount > 0 ? "quick" : "full");

  const state = {
    route: location.hash.replace("#", "") || "home",
    toolOrder: JSON.parse(safeStorage.getItem("nexusToolOrder") || "null") || tools.map(t => t.id),
    toolFilter: "all",
    toolSearch: "",
    toolSort: safeStorage.getItem("nexusToolSort") || "manual",
    noteFilter: "all",
    introMode: storedIntroMode || "quick",
    startupIntroMode,
    showIntro: startupIntroMode !== "off",
    justDragged: false,
    heroIndex: 0,
    heroTimer: null,
    motionReduced: safeStorage.getItem("nexusMotionReduced") === "true",
    motionLevel: Number(safeStorage.getItem("nexusMotionLevel") ?? 1),
    inkBurst: safeStorage.getItem("nexusInkBurst") !== "false",
    textureEnabled: safeStorage.getItem("nexusTexture") !== "false",
    density: safeStorage.getItem("nexusDensity") || "comfortable",
    accent: safeStorage.getItem("nexusAccent") || "pink",
    bridgeOnline: false,
    launchHistory: [],
    processes: [],
    dataRoot: "",
    activeProjectId: safeStorage.getItem("nexusActiveProject") || "hts",
    serverInfo: null,
    loadingToolId: null,
    atlas: { x: 0, y: 0, scale: 1, dragging: false, pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 }
  };

  const routeStage = document.getElementById("routeStage");
  const railNav = document.getElementById("railNav");
  const appShell = document.getElementById("appShell");
  const commandLayer = document.getElementById("commandLayer");
  const commandInput = document.getElementById("commandInput");
  const commandResults = document.getElementById("commandResults");
  const drawerLayer = document.getElementById("drawerLayer");
  const detailDrawer = document.getElementById("detailDrawer");
  const toastRegion = document.getElementById("toastRegion");


  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    let payload = {};
    try { payload = await response.json(); } catch (_) {}
    if (!response.ok || payload.ok === false) throw new Error(payload.error || `API error (${response.status})`);
    return payload;
  }

  function toolLaunchConfigured(tool) {
    return Boolean(tool?.launch?.enabled && tool?.launch?.target && tool?.launch?.type && tool?.health?.state !== "missing" && tool?.health?.state !== "invalid");
  }

  function toolHealthLabel(tool) {
    const stateValue = tool?.health?.state || (toolLaunchConfigured(tool) ? "ready" : "disabled");
    return stateValue === "ready" ? "LAUNCH READY" : stateValue === "missing" ? "PATH MISSING" : stateValue === "warning" ? "CHECK PATH" : stateValue === "invalid" ? "INVALID PATH" : "SETUP NEEDED";
  }

  function runningProcess(toolId) {
    return state.processes.find(item => item.toolId === toolId && item.running !== false) || null;
  }

  function syncToolOrder() {
    const ids = tools.map(tool => tool.id);
    state.toolOrder = [...state.toolOrder.filter(id => ids.includes(id)), ...ids.filter(id => !state.toolOrder.includes(id))];
    safeStorage.setItem("nexusToolOrder", JSON.stringify(state.toolOrder));
  }

  async function loadWorkspaceData() {
    try {
      const payload = await apiRequest("/api/workspace");
      const fallback = Object.fromEntries(tools.map(tool => [tool.id, tool]));
      if (Array.isArray(payload.tools) && payload.tools.length) {
        tools = payload.tools.map(tool => ({ ...fallback[tool.id], ...tool, launch: { ...(fallback[tool.id]?.launch || {}), ...(tool.launch || {}) } }));
      }
      if (Array.isArray(payload.projects) && payload.projects.length) projects = payload.projects;
      if (Array.isArray(payload.notes)) notes = payload.notes;
      state.launchHistory = Array.isArray(payload.history) ? payload.history : [];
      state.processes = Array.isArray(payload.processes) ? payload.processes : [];
      state.dataRoot = payload.dataRoot || "";
      state.bridgeOnline = true;
      state.serverInfo = { version: payload.version || APP_VERSION };
      syncToolOrder();
    } catch (error) {
      state.bridgeOnline = false;
      console.warn("Launch Bridge unavailable:", error);
    }
  }

  function recentToolIds() {
    const ids = [];
    for (const item of state.launchHistory) {
      if (item.success && item.toolId && !ids.includes(item.toolId)) ids.push(item.toolId);
    }
    return ids;
  }

  function lastLaunchFor(toolId) {
    return state.launchHistory.find(item => item.toolId === toolId && item.success) || null;
  }

  function orderedTools() {
    return state.toolOrder.map(id => tools.find(t => t.id === id)).filter(Boolean);
  }

  function usageCount(toolId) {
    return state.launchHistory.filter(item => item.toolId === toolId && item.success).length;
  }

  function allResources() {
    return projects.flatMap(project => (project.resources || []).map(resource => ({ ...resource, projectId: project.id, projectName: project.name, projectColor: project.color })));
  }

  function resourceById(resourceId) {
    for (const project of projects) {
      const resource = (project.resources || []).find(item => item.id === resourceId);
      if (resource) return { resource, project };
    }
    return null;
  }

  function activeProject() {
    return projects.find(project => project.id === state.activeProjectId) || projects[0] || null;
  }

  function attentionItems() {
    const missingTools = tools.filter(tool => tool?.launch?.enabled && ["missing", "invalid", "warning"].includes(tool?.health?.state));
    const failedLaunches = state.launchHistory.filter(item => item.success === false).slice(0, 3);
    const missingResources = allResources().filter(resource => resource.exists === false);
    return [
      ...missingTools.map(tool => ({ type: "tool", id: tool.id, title: `${tool.name} の起動先を確認`, detail: toolHealthLabel(tool) })),
      ...missingResources.map(resource => ({ type: "resource", id: resource.id, title: `${resource.label} が見つかりません`, detail: resource.projectName })),
      ...failedLaunches.map(item => ({ type: "tool", id: item.toolId, title: `${item.toolName || item.toolId} の起動に失敗`, detail: item.message || "ログを確認してください" }))
    ].slice(0, 6);
  }

  function renderNav() {
    railNav.innerHTML = navItems.map(([route, icon, label]) => `
      <button class="rail-link ${state.route === route ? "active" : ""}" data-route="${route}" aria-current="${state.route === route ? "page" : "false"}">
        <span class="rail-icon">${icon}</span><span>${label}</span>
      </button>`).join("");
  }

  function navigate(route) {
    state.route = route;
    location.hash = route;
    renderNav();
    renderRoute();
    appShell.classList.remove("menu-open");
    window.scrollTo({ top: 0, behavior: state.motionReduced ? "auto" : "smooth" });
  }

  function renderRoute() {
    stopHeroTimer();
    const route = state.route;
    if (route === "home") renderHome();
    else if (route === "tools") renderTools();
    else if (route === "projects") renderProjects();
    else if (route === "notes") renderNotes();
    else if (route === "guide") renderGuide();
    else if (route === "settings") renderSettings();
    else renderGeneric(route);
  }

  function cloneTemplate(id) {
    const template = document.getElementById(id);
    return template.content.cloneNode(true);
  }

  function renderHome() {
    routeStage.replaceChildren(cloneTemplate("homeTemplate"));
    renderQuickGrid();
    renderHomeTools();
    renderHomeProjects();
    renderHomeNotes();
    renderWorkspacePulse();
    renderHero();
    updateNotificationBadge();
    bindHeroMotion();
    updateFooterDate();
  }

  function renderQuickGrid() {
    const host = document.getElementById("quickGrid");
    host.innerHTML = quickActions.map(([label, icon, color, action], index) => `
      <button class="quick-action" style="--accent:${color};--tilt:${index % 2 ? "1deg" : "-1deg"}" data-action="${action}">
        <i>${icon}</i><span>${label}</span>
      </button>`).join("");
  }

  function toolCardMarkup(tool, compact = false) {
    const rotation = ({ "trd-31": "-.8deg", "ptd-50": ".4deg", "rps-09": "-.3deg", "mdi-10": ".7deg", "ptr-01": "-.5deg", "ws-control": ".3deg" })[tool.id] || "0deg";
    const draggable = compact || state.toolSort === "manual";
    return `
      <article class="tool-card ${draggable ? "is-manual" : "is-sorted"}" draggable="${draggable}" data-tool-id="${tool.id}" data-tool-kind="${tool.categoryKey}" style="--tool-bg:${tool.bg};--tag:${tool.tag};--card-rotation:${rotation}">
        <div class="tool-preview">
          <span class="tool-preview-tape"></span><span class="tool-motion-mark">${tool.id === "trd-31" ? "↻" : tool.id === "ptd-50" ? "≈" : tool.id === "rps-09" ? "⌁" : "✦"}</span>
          <span class="tool-drag-grip" aria-hidden="true">⋮⋮</span>
          <img src="${tool.image}" alt="${tool.name} のプレビュー" draggable="false" />
          ${tool.status === "PROTOTYPE" ? '<span class="tool-badge">PROTOTYPE</span>' : ""}
          <span class="launch-state ${runningProcess(tool.id) ? "running" : tool?.health?.state === "missing" || tool?.health?.state === "invalid" ? "missing" : toolLaunchConfigured(tool) ? "configured" : "unconfigured"}">${runningProcess(tool.id) ? "RUNNING" : toolHealthLabel(tool)}</span>
        </div>
        <div class="tool-card-body">
          <h3>${tool.name}</h3>
          <p>${compact ? tool.category : tool.description}</p>
          <footer class="tool-card-footer">
            <span class="tool-tag">${tool.category}</span>
            <button class="tool-open" data-open-tool="${tool.id}" aria-label="${tool.name}を開く">＋</button>
          </footer>
        </div>
      </article>`;
  }

  function renderHomeTools() {
    const host = document.getElementById("homeToolStrip");
    const recent = recentToolIds().map(id => tools.find(tool => tool.id === id)).filter(Boolean);
    const visible = [...recent, ...orderedTools().filter(tool => !recent.some(item => item.id === tool.id))].slice(0, 4);
    host.innerHTML = visible.map(t => toolCardMarkup(t, true)).join("");
    bindToolDrag(host);
    bindCardMotion(host);
  }

  function renderHomeProjects() {
    const host = document.getElementById("homeProjectList");
    const visible = [...projects].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || Number(b.progress || 0) - Number(a.progress || 0)).slice(0, 3);
    host.innerHTML = visible.map(project => `
      <button class="project-item" data-project-id="${escapeHtml(project.id)}" style="border:0;background:transparent;width:100%;text-align:left">
        <span class="project-thumb" style="--project-bg:${escapeHtml(project.color)}">${escapeHtml(project.icon)}</span>
        <span class="project-meta"><strong>${project.pinned ? '<i class="project-pin">PIN</i>' : ''}${escapeHtml(project.name)}</strong><small>${escapeHtml(project.nextAction || project.subtitle || "次の作業を設定")}</small><span class="progress-track"><span class="progress-fill" style="--progress:${Number(project.progress || 0)}%;--progress-color:${escapeHtml(project.color)}"></span></span></span>
        <span class="project-percent">${Number(project.progress || 0)}%</span>
      </button>`).join("");
  }

  function renderHomeNotes() {
    const host = document.getElementById("homeNoteList");
    const ordered = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))).slice(0, 4);
    host.innerHTML = ordered.map(note => `
      <div class="note-row" data-note-id="${escapeHtml(note.id)}">
        <div><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml(note.body)}</p></div>
        <span class="note-time">${escapeHtml(note.time || "今")}</span>
        <button class="star-button" data-toggle-pin="${escapeHtml(note.id)}" aria-label="ピン留め">${note.pinned ? "★" : "☆"}</button>
      </div>`).join("");
    const panel = host.closest(".notes-panel");
    
  }

  function renderWorkspacePulse() {
    const host = document.getElementById("workspacePulse");
    if (!host) return;
    const running = state.processes.filter(item => item.running !== false);
    const configured = tools.filter(toolLaunchConfigured);
    const recentId = recentToolIds()[0];
    const recent = tools.find(tool => tool.id === recentId);
    const project = activeProject();
    const attention = attentionItems();
    const mostUsed = [...tools].sort((a, b) => usageCount(b.id) - usageCount(a.id))[0];
    host.innerHTML = `
      <header class="section-heading pulse-heading"><div><h2>WORKSPACE PULSE</h2><p>いま使う情報だけを、実データから表示。</p></div><span class="pulse-live ${state.bridgeOnline ? "online" : "offline"}">${state.bridgeOnline ? "LIVE" : "OFFLINE"}</span></header>
      <div class="pulse-grid">
        <button class="pulse-card running" data-action="show-runtime"><small>RUNNING</small><strong>${running.length}</strong><span>${running.length ? escapeHtml(running.map(item => item.toolName || item.toolId).join(" / ")) : "起動中のツールなし"}</span></button>
        <button class="pulse-card recent" ${recent ? `data-open-tool="${escapeHtml(recent.id)}"` : 'data-route="tools"'}><small>RECENT TOOL</small><strong>${recent ? escapeHtml(recent.short || recent.name) : "未使用"}</strong><span>${recent ? `${usageCount(recent.id)}回起動` : `${configured.length}件設定済み`}</span></button>
        <button class="pulse-card project" data-action="open-active-project"><small>ACTIVE PROJECT</small><strong>${project ? escapeHtml(project.name) : "未設定"}</strong><span>${project ? escapeHtml(project.nextAction || "次の作業を設定") : "Project Atlasで作成"}</span></button>
        <button class="pulse-card attention ${attention.length ? "has-alert" : "clear"}" data-action="show-attention"><small>ATTENTION</small><strong>${attention.length}</strong><span>${attention.length ? escapeHtml(attention[0].title) : `よく使う: ${escapeHtml(mostUsed?.short || mostUsed?.name || "-")}`}</span></button>
      </div>`;
  }

  function updateNotificationBadge() {
    const badge = document.querySelector("#notificationButton span");
    const count = attentionItems().length;
    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    }
  }

  function openAttentionDrawer() {
    const items = attentionItems();
    detailDrawer.innerHTML = `
      <div class="drawer-editor-head"><span>WORKSPACE STATUS / v1.20.0</span><h2>ATTENTION</h2><button class="drawer-close" data-close-drawer aria-label="閉じる">×</button></div>
      <div class="attention-drawer">${items.length ? items.map(item => `<button class="attention-row" ${item.type === "tool" ? `data-open-tool="${escapeHtml(item.id)}"` : `data-open-resource="${escapeHtml(item.id)}"`}><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></button>`).join("") : '<div class="attention-clear"><strong>ALL CLEAR</strong><p>起動設定、登録資料、最近の実行に問題はありません。</p></div>'}</div>`;
    drawerLayer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function renderHero() {
    const ring = document.getElementById("ideaRing");
    const pagination = document.getElementById("heroPagination");
    if (!ring || !pagination) return;
    applyHeroSlide();
    pagination.innerHTML = heroSlides.map((_, index) => `<button data-hero-index="${index}" class="${index === state.heroIndex ? "active" : ""}" aria-label="スライド${index + 1}"></button>`).join("");
    if (!state.motionReduced) state.heroTimer = window.setInterval(() => {
      state.heroIndex = (state.heroIndex + 1) % heroSlides.length;
      applyHeroSlide(true);
    }, 6000);
  }

  function applyHeroSlide(animate = false) {
    const ring = document.getElementById("ideaRing");
    const pagination = document.getElementById("heroPagination");
    if (!ring) return;
    const slide = heroSlides[state.heroIndex];
    if (animate) ring.classList.add("active");
    setTimeout(() => {
      ring.innerHTML = slide.ring.map((part, index) => `<span>${part}</span>`).join("");
      ring.style.borderColor = slide.accent;
      document.documentElement.style.setProperty("--hero-accent", slide.accent);
      const canvas = document.querySelector(".live-collage-hero");
      if (canvas) canvas.dataset.heroSlide = String(state.heroIndex);
      const badge = document.getElementById("heroSlideMessage");
      if (badge) badge.textContent = slide.message;
      if (pagination) pagination.querySelectorAll("button").forEach((button, index) => button.classList.toggle("active", index === state.heroIndex));
      ring.classList.remove("active");
    }, animate ? 170 : 0);
  }

  function stopHeroTimer() {
    if (state.heroTimer) clearInterval(state.heroTimer);
    state.heroTimer = null;
  }

  function updateFooterDate() {
    const now = new Date();
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const weekday = document.getElementById("footerWeekday");
    const date = document.getElementById("footerDate");
    const month = document.getElementById("footerMonth");
    if (weekday) weekday.textContent = weekdays[now.getDay()];
    if (date) date.textContent = String(now.getDate()).padStart(2, "0");
    if (month) month.textContent = months[now.getMonth()];
  }

  function renderTools() {
    routeStage.replaceChildren(cloneTemplate("toolsTemplate"));
    const chipHost = document.getElementById("toolFilterChips");
    const filters = [["all", "ALL"], ["design", "3D DESIGN"], ["process", "PROCESS"], ["analysis", "SIMULATION"], ["ai", "AI"], ["document", "DOCUMENT"], ["control", "CONTROL"]];
    chipHost.innerHTML = filters.map(([key, label]) => `<button class="filter-chip ${state.toolFilter === key ? "active" : ""}" data-tool-filter="${key}">${label}</button>`).join("");
    const search = document.getElementById("toolSearch");
    const sort = document.getElementById("toolSort");
    search.value = state.toolSearch;
    sort.value = state.toolSort;
    search.addEventListener("input", event => { state.toolSearch = event.target.value; renderFullTools(); });
    sort.addEventListener("change", event => {
      state.toolSort = event.target.value;
      safeStorage.setItem("nexusToolSort", state.toolSort);
      renderFullTools();
    });
    renderFullTools();
  }

  function renderFullTools() {
    const host = document.getElementById("fullToolGrid");
    if (!host) return;
    const query = state.toolSearch.trim().toLowerCase();
    const filtered = orderedTools().filter(tool => {
      const categoryMatch = state.toolFilter === "all" || tool.categoryKey === state.toolFilter;
      const searchMatch = !query || `${tool.name} ${tool.category} ${tool.description}`.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
    const sorted = [...filtered];
    if (state.toolSort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    if (state.toolSort === "category") sorted.sort((a, b) => a.category.localeCompare(b.category, "ja") || a.name.localeCompare(b.name, "ja"));
    if (state.toolSort === "updated") sorted.sort((a, b) => tools.indexOf(a) - tools.indexOf(b));
    const count = document.getElementById("toolResultCount");
    const hint = document.getElementById("toolSortHint");
    if (count) count.textContent = `${sorted.length} TOOL${sorted.length === 1 ? "" : "S"}`;
    if (hint) hint.textContent = state.toolSort === "manual" ? "カードをドラッグして、自分の使いやすい順へ並べ替えられます。" : "並び順を固定表示中です。自由配置へ戻すとドラッグできます。";
    host.innerHTML = sorted.length ? sorted.map(tool => toolCardMarkup(tool)).join("") : '<div class="command-empty">該当するツールがありません。</div>';
    bindToolDrag(host);
    bindCardMotion(host);
  }

  function bindToolDrag(host) {
    if (!host || (state.toolSort !== "manual" && host.id !== "homeToolStrip")) return;
    let draggedId = null;
    host.querySelectorAll(".tool-card").forEach(card => {
      card.addEventListener("dragstart", event => {
        draggedId = card.dataset.toolId;
        state.justDragged = true;
        card.classList.add("dragging");
        document.body.classList.add("tool-drag-active");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedId);
      });
      card.addEventListener("dragend", () => {
        draggedId = null;
        window.setTimeout(() => { state.justDragged = false; }, 180);
        document.body.classList.remove("tool-drag-active");
        host.querySelectorAll(".tool-card").forEach(item => item.classList.remove("dragging", "drop-target"));
      });
      card.addEventListener("dragover", event => {
        event.preventDefault();
        if (draggedId && draggedId !== card.dataset.toolId) card.classList.add("drop-target");
      });
      card.addEventListener("dragleave", () => card.classList.remove("drop-target"));
      card.addEventListener("drop", event => {
        event.preventDefault();
        card.classList.remove("drop-target");
        const targetId = card.dataset.toolId;
        if (!draggedId || draggedId === targetId) return;
        const order = [...state.toolOrder];
        const from = order.indexOf(draggedId);
        const to = order.indexOf(targetId);
        order.splice(from, 1);
        order.splice(to, 0, draggedId);
        state.toolOrder = order;
        safeStorage.setItem("nexusToolOrder", JSON.stringify(order));
        if (state.route === "home") renderHomeTools(); else renderFullTools();
        showToast("並び順を更新しました", "この順番はブラウザに保存されます。");
      });
    });
  }

  function bindCardMotion(host) {
    if (!host || state.motionReduced || state.motionLevel === 0) return;
    host.querySelectorAll(".tool-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        if (card.classList.contains("dragging")) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty("--pointer-x", x.toFixed(3));
        card.style.setProperty("--pointer-y", y.toFixed(3));
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }

  function bindHeroMotion() {
    const canvas = document.querySelector(".live-collage-hero");
    if (!canvas || state.motionReduced || state.motionLevel === 0) return;
    canvas.addEventListener("pointermove", event => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      canvas.style.setProperty("--hero-x", x.toFixed(3));
      canvas.style.setProperty("--hero-y", y.toFixed(3));
    });
    canvas.addEventListener("pointerleave", () => {
      canvas.style.removeProperty("--hero-x");
      canvas.style.removeProperty("--hero-y");
    });
  }

  function renderProjects() {
    routeStage.replaceChildren(cloneTemplate("projectsTemplate"));
    if (!projects.some(project => project.id === state.activeProjectId)) state.activeProjectId = projects[0]?.id || "";
    renderProjectSwitcher();
    renderProjectWorkspace();
    renderAtlas();
  }

  function renderProjectSwitcher() {
    const host = document.getElementById("projectSwitcher");
    if (!host) return;
    host.innerHTML = projects.map(project => `
      <button class="project-switch ${project.id === state.activeProjectId ? "active" : ""}" data-select-project="${escapeHtml(project.id)}" style="--project-color:${escapeHtml(project.color || "#2fb7cb")}">
        <span>${escapeHtml(project.icon || "◇")}</span><strong>${escapeHtml(project.name)}</strong><small>${Number(project.progress || 0)}%</small>
      </button>`).join("") + `<button class="project-switch add" data-action="new-project"><span>＋</span><strong>NEW PROJECT</strong><small>追加</small></button>`;
  }

  function renderProjectWorkspace() {
    const host = document.getElementById("projectWorkspacePanel");
    if (!host) return;
    const project = activeProject();
    if (!project) { host.innerHTML = '<div class="project-workspace-empty">プロジェクトを作成してください。</div>'; return; }
    const linkedTools = (project.toolIds || []).map(id => tools.find(tool => tool.id === id)).filter(Boolean);
    const relatedNotes = notes.filter(note => note.projectId === project.id).sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, 5);
    const resources = project.resources || [];
    host.innerHTML = `
      <header class="project-workspace-head" style="--project-color:${escapeHtml(project.color || "#2fb7cb")}">
        <div><span>${project.pinned ? "PINNED PROJECT" : "ACTIVE PROJECT"}</span><h2>${escapeHtml(project.name)}</h2><p>${escapeHtml(project.subtitle || "")}</p></div>
        <button data-action="edit-project" data-project="${escapeHtml(project.id)}">EDIT PROJECT</button>
      </header>
      <div class="project-workspace-grid">
        <article class="project-next-card"><small>NEXT ACTION</small><strong>${escapeHtml(project.nextAction || "次の作業を設定してください")}</strong><div class="project-progress-line"><i style="width:${Number(project.progress || 0)}%;background:${escapeHtml(project.color || "#2fb7cb")}"></i></div><span>${Number(project.progress || 0)}% COMPLETE</span></article>
        <article class="project-resource-card"><header><div><small>FILES & FOLDERS</small><strong>${resources.length} ITEMS</strong></div><div><button data-action="add-project-file">＋ FILE</button><button data-action="add-project-folder">＋ FOLDER</button></div></header>
          <div class="resource-list">${resources.length ? resources.slice(0, 6).map(resource => `<div class="resource-row ${resource.exists === false ? "missing" : ""}"><button class="resource-open" data-open-resource="${escapeHtml(resource.id)}"><i>${resource.type === "folder" ? "▰" : resource.kind === "output" ? "◆" : "▤"}</i><span><strong>${escapeHtml(resource.label)}</strong><small>${escapeHtml(resource.kind || resource.type || "reference")} · ${escapeHtml(resource.path)}</small></span></button><button class="resource-remove" data-remove-resource="${escapeHtml(resource.id)}" aria-label="登録を解除">×</button></div>`).join("") : '<p class="resource-empty">解析結果、資料、研究フォルダーを登録できます。</p>'}</div>
        </article>
        <article class="project-tool-card"><header><small>LINKED TOOLS</small><strong>${linkedTools.length}</strong></header><div class="mini-tool-list">${linkedTools.length ? linkedTools.map(tool => `<button data-open-tool="${escapeHtml(tool.id)}" style="--mini-color:${escapeHtml(tool.tag || tool.bg)}"><i>${runningProcess(tool.id) ? "●" : "○"}</i><span>${escapeHtml(tool.short || tool.name)}</span></button>`).join("") : '<p>関連ツールはありません。</p>'}</div></article>
        <article class="project-note-card"><header><small>RELATED NOTES</small><strong>${relatedNotes.length}</strong></header><div class="mini-note-list">${relatedNotes.length ? relatedNotes.map(note => `<button data-edit-note="${escapeHtml(note.id)}"><i>${note.pinned ? "★" : "✎"}</i><span><strong>${escapeHtml(note.title)}</strong><small>${escapeHtml(note.tag || "NOTE")}</small></span></button>`).join("") : '<p>このプロジェクトに関連するメモはありません。</p>'}</div></article>
      </div>`;
  }

  function renderAtlas() {
    const world = document.getElementById("atlasWorld");
    const viewport = document.getElementById("atlasViewport");
    if (!world || !viewport) return;
    const project = projects.find(item => item.id === state.activeProjectId) || projects[0];
    if (!project) {
      world.innerHTML = '<div class="atlas-empty"><strong>プロジェクトがありません</strong><button data-action="new-project">＋ PROJECT</button></div>';
      return;
    }
    const linkedTools = (project.toolIds || []).map(id => tools.find(tool => tool.id === id)).filter(Boolean);
    const projectResources = (project.resources || []).slice(0, 4);
    const relatedNotes = notes.filter(note => note.projectId === project.id).slice(0, 3);
    const positions = [
      [-350,-180],[0,-245],[350,-170],[-400,80],[390,100],[-250,230],[40,250],[315,230],[-120,-125],[160,-100],[180,105],[-150,115]
    ];
    let positionIndex = 0;
    const nextPosition = () => positions[(positionIndex++) % positions.length];
    const nodes = [
      { id: "core", label: project.name, sub: project.nextAction || project.subtitle || "Research Project", x: 0, y: 0, color: project.color || "#ec2f79", core: true, kind: "project" },
      ...linkedTools.map(tool => { const [x,y] = nextPosition(); return { id: tool.id, label: tool.short || tool.name, sub: tool.category, x, y, color: tool.tag || tool.bg || "#2fb7cb", tool: tool.id, kind: "tool" }; }),
      ...projectResources.map(resource => { const [x,y] = nextPosition(); return { id: resource.id, label: resource.label, sub: resource.kind === "output" ? "OUTPUT" : resource.type === "folder" ? "FOLDER" : "REFERENCE", x, y, color: resource.kind === "output" ? "#ec2f79" : "#f3bf31", resource: resource.id, kind: "resource" }; }),
      ...relatedNotes.map(note => { const [x,y] = nextPosition(); return { id: note.id, label: note.title, sub: note.tag || "NOTE", x, y, color: note.color || "#2fb7cb", note: note.id, kind: "note" }; })
    ];
    world.innerHTML = nodes.map((node, index) => `
      <button class="atlas-node ${node.core ? "core" : ""} atlas-node-${node.kind || "item"}" data-atlas-node="${escapeHtml(node.id)}" ${node.tool ? `data-open-tool="${escapeHtml(node.tool)}"` : ""} ${node.resource ? `data-open-resource="${escapeHtml(node.resource)}"` : ""} ${node.note ? `data-edit-note="${escapeHtml(node.note)}"` : ""}
        style="left:${490 + node.x}px;top:${280 + node.y}px;--node-color:${escapeHtml(node.color)};--node-rotation:${index % 2 ? ".8deg" : "-.7deg"}">
        <span class="atlas-tape"></span><span class="atlas-pin"></span>
        <strong>${escapeHtml(node.label)}</strong><small>${escapeHtml(node.sub)}</small>
      </button>`).join("") + `<div class="atlas-project-progress" style="--project-color:${escapeHtml(project.color || "#2fb7cb")}"><strong>${Number(project.progress || 0)}%</strong><span>PROJECT PROGRESS</span><button data-action="edit-project" data-project="${escapeHtml(project.id)}">EDIT PROJECT</button></div>` + `<div class="atlas-scribble atlas-scribble-a">TOOLS → FILES → OUTPUTS</div><div class="atlas-scribble atlas-scribble-b">道具・資料・メモを一つの地図へ。</div>`;
    drawAtlasLines(nodes);
    applyAtlasTransform();
    bindAtlasEvents(viewport);
  }

  function drawAtlasLines(nodes) {
    const svg = document.getElementById("atlasLines");
    if (!svg) return;
    const core = nodes.find(node => node.id === "core");
    if (!core) return;
    svg.setAttribute("viewBox", "0 0 980 560");
    svg.innerHTML = nodes.filter(node => node.id !== "core").map((node,index) => {
      const x1 = 490 + core.x, y1 = 280 + core.y, x2 = 490 + node.x, y2 = 280 + node.y;
      const mx = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
      return `<path class="atlas-thread ${index < 3 ? "major" : "minor"}" d="${d}" fill="none" stroke="${escapeHtml(node.color)}" stroke-width="${index < 3 ? 4 : 2.5}" stroke-dasharray="${index < 3 ? "0" : "8 7"}" opacity=".76" style="--thread-delay:${index * 70}ms" />`;
    }).join("");
    svg.style.left = "50%";
    svg.style.top = "50%";
    svg.style.width = "980px";
    svg.style.height = "560px";
    svg.style.transformOrigin = "0 0";
  }

  function bindAtlasEvents(viewport) {
    viewport.addEventListener("pointerdown", event => {
      if (event.target.closest(".atlas-node") || event.target.closest(".atlas-project-progress")) return;
      state.atlas.dragging = true;
      state.atlas.pointerId = event.pointerId;
      state.atlas.startX = event.clientX;
      state.atlas.startY = event.clientY;
      state.atlas.originX = state.atlas.x;
      state.atlas.originY = state.atlas.y;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add("dragging");
    });
    viewport.addEventListener("pointermove", event => {
      if (!state.atlas.dragging || state.atlas.pointerId !== event.pointerId) return;
      state.atlas.x = state.atlas.originX + event.clientX - state.atlas.startX;
      state.atlas.y = state.atlas.originY + event.clientY - state.atlas.startY;
      applyAtlasTransform();
    });
    const end = event => {
      if (!state.atlas.dragging) return;
      state.atlas.dragging = false;
      state.atlas.pointerId = null;
      viewport.classList.remove("dragging");
      try { viewport.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    viewport.addEventListener("pointerup", end);
    viewport.addEventListener("pointercancel", end);
    viewport.addEventListener("wheel", event => {
      event.preventDefault();
      const previous = state.atlas.scale;
      const next = Math.min(1.65, Math.max(.62, previous * (event.deltaY > 0 ? .91 : 1.1)));
      const rect = viewport.getBoundingClientRect();
      const pointerX = event.clientX - rect.left - rect.width / 2;
      const pointerY = event.clientY - rect.top - rect.height / 2;
      state.atlas.x = pointerX - (pointerX - state.atlas.x) * (next / previous);
      state.atlas.y = pointerY - (pointerY - state.atlas.y) * (next / previous);
      state.atlas.scale = next;
      applyAtlasTransform();
    }, { passive: false });
  }

  function applyAtlasTransform() {
    const world = document.getElementById("atlasWorld");
    const lines = document.getElementById("atlasLines");
    const label = document.getElementById("atlasZoomLabel");
    if (!world || !lines) return;
    const transform = `translate(${state.atlas.x}px, ${state.atlas.y}px) scale(${state.atlas.scale}) translate(-50%, -50%)`;
    world.style.transform = transform;
    lines.style.transform = transform;
    if (label) label.textContent = `${Math.round(state.atlas.scale * 100)}%`;
  }

  function zoomAtlas(factor) {
    const previous = state.atlas.scale;
    state.atlas.scale = Math.min(1.65, Math.max(.62, previous * factor));
    applyAtlasTransform();
  }

  function resetAtlas() {
    state.atlas.x = 0;
    state.atlas.y = 0;
    state.atlas.scale = 1;
    applyAtlasTransform();
  }

  function renderNotes() {
    routeStage.replaceChildren(cloneTemplate("notesTemplate"));
    renderNoteBoard();
  }

  function renderNoteBoard() {
    const board = document.getElementById("noteBoard");
    if (!board) return;
    const filtered = notes
      .filter(note => state.noteFilter === "all" || (state.noteFilter === "pinned" && note.pinned) || state.noteFilter === "recent")
      .sort((a, b) => state.noteFilter === "recent" ? notes.indexOf(a) - notes.indexOf(b) : Number(b.pinned) - Number(a.pinned));
    document.querySelectorAll("[data-note-filter]").forEach(button => button.classList.toggle("active", button.dataset.noteFilter === state.noteFilter));
    const count = document.getElementById("noteResultCount");
    if (count) count.textContent = `${filtered.length} NOTE${filtered.length === 1 ? "" : "S"}`;

    const makePoints = body => {
      const segments = String(body || "")
        .split(/[。\n]+/)
        .map(item => item.trim())
        .filter(Boolean);
      if (!segments.length) return [];
      return segments.slice(0, 2);
    };

    board.innerHTML = filtered.map((note, index) => {
      const points = makePoints(note.body);
      const project = projects.find(item => item.id === note.projectId);
      return `
      <article class="note-card note-document ${note.pinned ? "is-pinned" : ""}" data-note-id="${escapeHtml(note.id)}" style="--note-accent:${escapeHtml(note.color || "#d92622")};--note-rotation:${index % 2 ? ".25deg" : "-.2deg"}">
        ${note.pinned ? '<span class="note-document-tape" aria-hidden="true"></span>' : ''}
        <button class="note-pin-button" data-toggle-pin="${escapeHtml(note.id)}" aria-label="${note.pinned ? "ピン留めを外す" : "ピン留めする"}">${note.pinned ? "★" : "☆"}</button>
        <header class="note-document-header">
          <span class="note-document-code">${String(index + 1).padStart(2, "0")} /</span>
          <span class="note-card-tag">${escapeHtml(note.tag || "NOTE")}</span>
        </header>
        <h3>${escapeHtml(note.title)}</h3>
        <span class="note-document-rule" aria-hidden="true"></span>
        <p class="note-document-lead">${escapeHtml(note.body)}</p>
        <div class="note-document-points">
          ${points.map((point, pointIndex) => `<div class="note-document-point"><span>${String(pointIndex + 1).padStart(2, "0")} /</span><p>${escapeHtml(point)}</p></div>`).join("")}
          ${project ? `<div class="note-document-point note-project-link"><span>REF /</span><p>${escapeHtml(project.name)}</p></div>` : ""}
        </div>
        <footer><span>${note.pinned ? "PINNED NOTE" : "RESEARCH NOTE"}</span><span>${escapeHtml(note.time || "今")}</span></footer>
        <div class="note-card-actions"><button data-edit-note="${escapeHtml(note.id)}">編集</button><button class="danger-action" data-delete-note="${escapeHtml(note.id)}">削除</button></div>
      </article>`;
    }).join("");
  }

  function openNoteEditor(noteId = "") {
    const existing = notes.find(note => note.id === noteId);
    const note = existing || {
      id: `note-${Date.now().toString(36)}`,
      title: "",
      body: "",
      tag: "IDEA",
      color: "#f7ce51",
      pinned: false,
      projectId: state.activeProjectId || ""
    };
    detailDrawer.innerHTML = `
      <div class="drawer-editor-head"><span>RESEARCH NOTE / v1.20.0</span><h2>${existing ? "EDIT NOTE" : "NEW NOTE"}</h2><button class="drawer-close" data-close-drawer aria-label="閉じる">×</button></div>
      <form class="tool-config-form note-editor-form" id="noteEditorForm" data-note-id="${escapeHtml(note.id)}">
        <label class="form-wide"><span>TITLE</span><input name="title" value="${escapeHtml(note.title)}" placeholder="メモの見出し" required></label>
        <label class="form-wide"><span>BODY</span><textarea name="body" rows="8" placeholder="考え、違和感、次に試すこと">${escapeHtml(note.body)}</textarea></label>
        <label><span>TAG</span><input name="tag" value="${escapeHtml(note.tag || "IDEA")}"></label>
        <label><span>COLOR</span><input name="color" type="color" value="${escapeHtml(note.color || "#f7ce51")}"></label>
        <label class="form-wide"><span>PROJECT</span><select name="projectId"><option value="">関連付けなし</option>${projects.map(project => `<option value="${escapeHtml(project.id)}" ${note.projectId === project.id ? "selected" : ""}>${escapeHtml(project.name)}</option>`).join("")}</select></label>
        <label class="switch-field"><span>PINNED</span><input name="pinned" type="checkbox" ${note.pinned ? "checked" : ""}><i></i></label>
        <div class="tool-config-actions form-wide"><button type="button" data-action="save-note">SAVE NOTE</button>${existing ? `<button type="button" class="danger-action" data-action="delete-note" data-note="${escapeHtml(note.id)}">DELETE</button>` : ""}</div>
      </form>`;
    drawerLayer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  async function saveNote() {
    const form = document.getElementById("noteEditorForm");
    if (!form) return;
    const data = new FormData(form);
    const id = form.dataset.noteId;
    const existing = notes.find(note => note.id === id) || {};
    const note = {
      ...existing,
      id,
      title: String(data.get("title") || "").trim(),
      body: String(data.get("body") || "").trim(),
      tag: String(data.get("tag") || "IDEA").trim().toUpperCase(),
      color: String(data.get("color") || "#f7ce51"),
      pinned: data.get("pinned") === "on",
      projectId: String(data.get("projectId") || ""),
      time: existing.time || "今"
    };
    try {
      const payload = await apiRequest("/api/notes/save", { method: "POST", body: JSON.stringify({ note }) });
      notes = payload.notes || notes;
      closeDrawer();
      if (state.route === "notes") renderNoteBoard();
      if (state.route === "home") renderHomeNotes();
      showToast("メモを保存しました", note.title);
    } catch (error) { showToast("保存できませんでした", error.message); }
  }

  async function deleteNote(noteId) {
    const note = notes.find(item => item.id === noteId);
    if (!note || !window.confirm(`「${note.title}」を削除しますか？`)) return;
    try {
      const payload = await apiRequest("/api/notes/delete", { method: "POST", body: JSON.stringify({ noteId }) });
      notes = payload.notes || notes;
      closeDrawer();
      if (state.route === "notes") renderNoteBoard();
      if (state.route === "home") renderHomeNotes();
      showToast("メモを削除しました", note.title);
    } catch (error) { showToast("削除できませんでした", error.message); }
  }

  async function persistPin(noteId) {
    const note = notes.find(item => item.id === noteId);
    if (!note) return;
    note.pinned = !note.pinned;
    try {
      const payload = await apiRequest("/api/notes/save", { method: "POST", body: JSON.stringify({ note }) });
      notes = payload.notes || notes;
      if (state.route === "home") renderHomeNotes(); else renderNoteBoard();
    } catch (error) {
      note.pinned = !note.pinned;
      showToast("ピン留めを変更できませんでした", error.message);
    }
  }

  function openProjectEditor(projectId = "") {
    const existing = projects.find(project => project.id === projectId);
    const project = existing || {
      id: `project-${Date.now().toString(36)}`,
      name: "New Research Project",
      subtitle: "研究テーマの説明",
      progress: 0,
      color: "#2fb7cb",
      icon: "◇",
      toolIds: [],
      resources: [],
      nextAction: "",
      pinned: false
    };
    detailDrawer.innerHTML = `
      <div class="drawer-editor-head"><span>PROJECT REGISTRY / v1.20.0</span><h2>${existing ? "EDIT PROJECT" : "NEW PROJECT"}</h2><button class="drawer-close" data-close-drawer aria-label="閉じる">×</button></div>
      <form class="tool-config-form project-editor-form" id="projectEditorForm" data-project-id="${escapeHtml(project.id)}">
        <label><span>PROJECT ID</span><input name="id" value="${escapeHtml(project.id)}" ${existing ? "readonly" : ""} required></label>
        <label><span>ICON</span><input name="icon" value="${escapeHtml(project.icon || "◇")}" maxlength="4"></label>
        <label class="form-wide"><span>PROJECT NAME</span><input name="name" value="${escapeHtml(project.name)}" required></label>
        <label class="form-wide"><span>SUBTITLE</span><input name="subtitle" value="${escapeHtml(project.subtitle || "")}"></label>
        <label class="form-wide"><span>NEXT ACTION</span><input name="nextAction" value="${escapeHtml(project.nextAction || "")}" placeholder="次に行う具体的な作業"></label>
        <label><span>PROGRESS</span><input name="progress" type="number" min="0" max="100" value="${Number(project.progress || 0)}"></label>
        <label><span>COLOR</span><input name="color" type="color" value="${escapeHtml(project.color || "#2fb7cb")}"></label>
        <label class="switch-field"><span>PIN ON HOME</span><input name="pinned" type="checkbox" ${project.pinned ? "checked" : ""}><i></i></label>
        <fieldset class="form-wide project-tool-picker"><legend>LINKED TOOLS</legend>${tools.map(tool => `<label><input type="checkbox" name="toolIds" value="${escapeHtml(tool.id)}" ${(project.toolIds || []).includes(tool.id) ? "checked" : ""}><span>${escapeHtml(tool.name)}</span></label>`).join("")}</fieldset>
        <div class="tool-config-actions form-wide"><button type="button" data-action="save-project">SAVE PROJECT</button></div>
      </form>`;
    drawerLayer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  async function saveProject() {
    const form = document.getElementById("projectEditorForm");
    if (!form) return;
    const data = new FormData(form);
    const existing = projects.find(item => item.id === String(data.get("id") || "").trim()) || {};
    const project = {
      ...existing,
      id: String(data.get("id") || "").trim(),
      name: String(data.get("name") || "").trim(),
      subtitle: String(data.get("subtitle") || "").trim(),
      nextAction: String(data.get("nextAction") || "").trim(),
      pinned: data.get("pinned") === "on",
      progress: Math.max(0, Math.min(100, Number(data.get("progress") || 0))),
      color: String(data.get("color") || "#2fb7cb"),
      icon: String(data.get("icon") || "◇"),
      toolIds: data.getAll("toolIds").map(String),
      resources: existing.resources || []
    };
    try {
      const payload = await apiRequest("/api/projects/save", { method: "POST", body: JSON.stringify({ project }) });
      projects = payload.projects || projects;
      state.activeProjectId = project.id;
      safeStorage.setItem("nexusActiveProject", project.id);
      closeDrawer();
      if (state.route === "projects") renderProjects();
      if (state.route === "home") renderHomeProjects();
      showToast("プロジェクトを保存しました", project.name);
    } catch (error) { showToast("保存できませんでした", error.message); }
  }

  function renderGuide() {
    routeStage.replaceChildren(cloneTemplate("guideTemplate"));
  }

  function renderGeneric(route) {
    const data = genericContent[route] || genericContent.shared;
    routeStage.replaceChildren(cloneTemplate("genericTemplate"));
    document.getElementById("genericNumber").textContent = data.number;
    document.getElementById("genericKicker").textContent = data.kicker;
    document.getElementById("genericTitle").textContent = data.title;
    document.getElementById("genericDescription").textContent = data.description;
    document.getElementById("genericGrid").innerHTML = data.cards.map(([title, text, accent]) => `<article class="generic-card" style="--accent:${accent}"><h3>${title}</h3><p>${text}</p></article>`).join("");
  }

  function renderSettings() {
    routeStage.replaceChildren(cloneTemplate("settingsTemplate"));
    const motion = document.getElementById("settingMotion");
    const level = document.getElementById("settingMotionLevel");
    const burst = document.getElementById("settingInkBurst");
    const texture = document.getElementById("settingTexture");
    motion.checked = !state.motionReduced;
    level.value = String(state.motionLevel);
    burst.checked = state.inkBurst;
    texture.checked = state.textureEnabled;
    updateSettingsControls();
    renderBridgeSettings();
    motion.addEventListener("change", () => {
      state.motionReduced = !motion.checked;
      safeStorage.setItem("nexusMotionReduced", String(state.motionReduced));
      applyPreferences();
      updateSettingsControls();
    });
    level.addEventListener("input", () => {
      state.motionLevel = Number(level.value);
      safeStorage.setItem("nexusMotionLevel", String(state.motionLevel));
      applyPreferences();
      updateSettingsControls();
    });
    burst.addEventListener("change", () => {
      state.inkBurst = burst.checked;
      safeStorage.setItem("nexusInkBurst", String(state.inkBurst));
      applyPreferences();
    });
    texture.addEventListener("change", () => {
      state.textureEnabled = texture.checked;
      safeStorage.setItem("nexusTexture", String(state.textureEnabled));
      applyPreferences();
    });
    document.querySelectorAll("[data-intro-mode]").forEach(button => {
      button.addEventListener("click", () => {
        const mode = String(button.dataset.introMode || "quick").toLowerCase();
        if (!["full", "quick", "off"].includes(mode)) return;
        state.introMode = mode;
        state.showIntro = mode !== "off";
        safeStorage.setItem("nexusIntroMode", mode);
        safeStorage.setItem("nexusShowIntro", String(state.showIntro));
        updateSettingsControls();
        const message = mode === "full" ? "次回起動時に完全版を再生します。" : mode === "quick" ? "次回起動時に終盤約4秒を再生します。" : "次回から直接Homeを開きます。";
        showToast("起動イントロ設定", message);
      });
    });
  }

  function renderBridgeSettings() {
    const status = document.getElementById("bridgeStatus");
    const count = document.getElementById("bridgeToolCount");
    const history = document.getElementById("bridgeHistory");
    const processes = document.getElementById("bridgeProcesses");
    const dataRoot = document.getElementById("dataRootLabel");
    if (status) {
      status.textContent = state.bridgeOnline ? "ONLINE" : "OFFLINE";
      status.classList.toggle("online", state.bridgeOnline);
    }
    if (count) count.textContent = `${tools.filter(toolLaunchConfigured).length} / ${tools.length} CONFIGURED`;
    if (dataRoot) dataRoot.textContent = state.dataRoot ? `DATA ROOT: ${state.dataRoot}` : "DATA ROOT: OFFLINE";
    if (processes) processes.innerHTML = state.processes.length ? state.processes.map(item => `<div class="running-process-row"><span class="running-pulse"></span><strong>${escapeHtml(item.toolName || item.toolId)}</strong><small>PID ${item.pid}</small><button data-action="focus-tool" data-tool="${escapeHtml(item.toolId)}">FOCUS</button><button class="danger-action" data-action="stop-tool" data-tool="${escapeHtml(item.toolId)}">STOP</button></div>`).join("") : '<p>現在NEXUSから起動中のアプリはありません。</p>';
    if (history) history.innerHTML = state.launchHistory.slice(0, 5).map(item => `<div><span class="history-dot ${item.success ? "success" : "failed"}"></span><strong>${escapeHtml(item.toolName || item.toolId)}</strong><small>${escapeHtml(new Date(item.startedAt).toLocaleString("ja-JP"))}</small></div>`).join("") || '<p>起動履歴はまだありません。</p>';
  }

  function updateSettingsControls() {
    const labels = ["STILL", "STANDARD", "ENERGETIC"];
    const label = document.getElementById("motionLevelLabel");
    if (label) label.textContent = labels[state.motionLevel] || labels[1];
    document.querySelectorAll("[data-density]").forEach(button => button.classList.toggle("active", button.dataset.density === state.density));
    document.querySelectorAll("[data-accent]").forEach(button => button.classList.toggle("active", button.dataset.accent === state.accent));
    document.querySelectorAll("[data-intro-mode]").forEach(button => button.classList.toggle("active", button.dataset.introMode === state.introMode));
  }

  function applyPreferences() {
    document.documentElement.classList.toggle("motion-reduced", state.motionReduced || state.motionLevel === 0);
    document.documentElement.classList.toggle("texture-off", !state.textureEnabled);
    document.documentElement.dataset.motionLevel = String(state.motionLevel);
    document.documentElement.dataset.density = state.density;
    document.documentElement.dataset.accent = state.accent;
  }

  function resetPreferences() {
    state.motionReduced = false;
    state.motionLevel = 1;
    state.inkBurst = true;
    state.textureEnabled = true;
    state.density = "comfortable";
    state.accent = "pink";
    state.introMode = "quick";
    state.startupIntroMode = "quick";
    state.showIntro = true;
    state.toolSort = "manual";
    ["nexusMotionReduced","nexusMotionLevel","nexusInkBurst","nexusTexture","nexusDensity","nexusAccent","nexusShowIntro","nexusIntroMode","nexusIntroSeenCount","nexusToolSort"].forEach(key => safeStorage.removeItem(key));
    applyPreferences();
    renderSettings();
    showToast("設定を初期化しました", "標準の動きと紙質へ戻しました。");
  }

  function openTool(toolId) {
    const tool = tools.find(item => item.id === toolId);
    if (!tool) return;
    const ready = toolLaunchConfigured(tool);
    const running = runningProcess(tool.id);
    const last = lastLaunchFor(tool.id);
    const launchLabel = running ? "BRING TO FRONT" : ready ? (state.loadingToolId === tool.id ? "LAUNCHING..." : "OPEN TOOL") : "CONFIGURE TO LAUNCH";
    const launchAction = running ? "focus-tool" : ready ? "launch-tool" : "configure-tool";
    const historyRows = state.launchHistory.filter(item => item.toolId === tool.id).slice(0, 4);
    detailDrawer.innerHTML = `
      <div class="drawer-hero" style="--drawer-bg:${tool.bg}">
        <img src="${escapeHtml(tool.image)}" alt="${escapeHtml(tool.name)}" />
        <button class="drawer-close" data-close-drawer aria-label="閉じる">×</button>
      </div>
      <div class="drawer-body" style="--drawer-accent:${tool.tag}">
        <span class="drawer-category">${escapeHtml(tool.category)}</span>
        <h2>${escapeHtml(tool.name)}</h2>
        <p class="drawer-description">${escapeHtml(tool.description)}</p>
        <div class="drawer-metrics">
          <div class="drawer-metric"><small>STATUS</small><strong>${running ? "RUNNING" : escapeHtml(tool.status)}</strong></div>
          <div class="drawer-metric"><small>VERSION</small><strong>${escapeHtml(tool.version)}</strong></div>
          <div class="drawer-metric"><small>LAUNCH</small><strong class="${running ? "launch-running-text" : ready ? "launch-ready-text" : "launch-setup-text"}">${running ? `PID ${running.pid}` : ready ? "READY" : "NOT SET"}</strong></div>
        </div>
        <div class="launch-summary ${running ? "running" : ready ? "ready" : "needs-setup"}">
          <span>${running ? "ACTIVE PROCESS" : ready ? "LOCAL LAUNCH BRIDGE" : "LAUNCH SETTINGS REQUIRED"}</span>
          <strong>${running ? "NEXUSから起動中" : ready ? escapeHtml(tool.launch.type.toUpperCase()) : "起動ファイルまたはURLを登録してください"}</strong>
          ${running ? `<small>STARTED: ${escapeHtml(new Date(running.startedAt).toLocaleString("ja-JP"))}</small>` : last ? `<small>LAST: ${escapeHtml(new Date(last.startedAt).toLocaleString("ja-JP"))}</small>` : ""}
        </div>
        <div class="drawer-actions ${running ? "drawer-actions-running" : "drawer-actions-three"}">
          <button data-action="${launchAction}" data-tool="${tool.id}" ${state.loadingToolId === tool.id ? "disabled" : ""}>${launchLabel}</button>
          ${running ? `<button class="danger-action" data-action="stop-tool" data-tool="${tool.id}">STOP</button>` : `<button data-action="configure-tool" data-tool="${tool.id}">LAUNCH SETTINGS</button>`}
          <button data-action="add-to-project" data-tool="${tool.id}">ADD TO PROJECT</button>
        </div>
        <div class="drawer-files"><h3>RECENT FILES</h3>${(tool.recentFiles || []).map(file => `<div class="drawer-file"><span>${escapeHtml(file)}</span><span>↗</span></div>`).join("")}</div>
        <div class="launch-history-mini"><h3>LAUNCH HISTORY</h3>${historyRows.length ? historyRows.map(item => `<div><span class="history-dot ${item.success ? "success" : "failed"}"></span><strong>${item.success ? "STARTED" : "FAILED"}</strong><small>${escapeHtml(new Date(item.startedAt).toLocaleString("ja-JP"))}</small></div>`).join("") : "<p>まだ起動履歴はありません。</p>"}</div>
      </div>`;
    drawerLayer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function openToolEditor(toolId = "") {
    const existing = tools.find(item => item.id === toolId);
    const tool = existing || {
      id: `tool-${Date.now().toString(36)}`,
      name: "New Research Tool",
      short: "New Tool",
      category: "UTILITY",
      categoryKey: "utility",
      description: "研究用ツールの説明を入力してください。",
      image: "assets/tools/model-interpreter.svg",
      bg: "#2fb7cb",
      tag: "#2fb7cb",
      files: 0,
      updated: "未使用",
      status: "READY",
      version: "1.0.0",
      recentFiles: [],
      launch: { enabled: false, type: "exe", target: "", workingDirectory: "", args: [], interpreter: "" }
    };
    const launch = tool.launch || {};
    const health = tool.health || {};
    detailDrawer.innerHTML = `
      <div class="drawer-editor-head"><span>TOOL REGISTRY / v1.20.0</span><h2>${existing ? "EDIT TOOL" : "SMART REGISTER"}</h2><button class="drawer-close" data-close-drawer aria-label="閉じる">×</button></div>
      <form class="tool-config-form tool-wizard-form" id="toolConfigForm" data-tool-id="${escapeHtml(tool.id)}">
        <section class="wizard-step form-wide" data-step="1">
          <header><b>01</b><div><strong>起動先を選ぶ</strong><small>EXE、ショートカット、Python、URL、フォルダーを自動判別します。</small></div></header>
          <label class="path-field"><span>TARGET PATH / URL</span><div><input name="target" value="${escapeHtml(launch.target || "")}" placeholder="ファイルを選択、またはURLを入力"><button type="button" data-action="browse-target">参照</button></div></label>
          <div class="wizard-detect-row"><button type="button" data-action="detect-tool">AUTO DETECT</button><span id="toolDetectStatus">${escapeHtml(health.message || (existing ? "現在の設定を確認できます。" : "起動先を選ぶと名前と方式を自動入力します。"))}</span></div>
        </section>
        <section class="wizard-step form-wide" data-step="2">
          <header><b>02</b><div><strong>表示内容を整える</strong><small>あとからいつでも変更できます。</small></div></header>
          <div class="wizard-fields">
            <label><span>TOOL ID</span><input name="id" value="${escapeHtml(tool.id)}" ${existing ? "readonly" : ""} required></label>
            <label><span>DISPLAY NAME</span><input name="name" value="${escapeHtml(tool.name)}" required></label>
            <label><span>CATEGORY</span><input name="category" value="${escapeHtml(tool.category)}" required></label>
            <label><span>CATEGORY KEY</span><select name="categoryKey">${["design","process","analysis","ai","document","control","utility"].map(key => `<option value="${key}" ${tool.categoryKey === key ? "selected" : ""}>${key.toUpperCase()}</option>`).join("")}</select></label>
            <label class="form-wide"><span>DESCRIPTION</span><textarea name="description" rows="3">${escapeHtml(tool.description)}</textarea></label>
            <label class="form-wide path-field"><span>PREVIEW IMAGE</span><div><input name="image" value="${escapeHtml(tool.image || "")}" placeholder="同梱画像またはカスタム画像"><button type="button" data-action="import-tool-image">画像を選ぶ</button></div></label>
            <div class="tool-preview-choice form-wide"><img id="toolWizardPreview" src="${escapeHtml(tool.image || "assets/tools/model-interpreter.svg")}" alt="プレビュー"><span>カードに表示される画像です。カスタム画像はユーザーデータへコピーされます。</span></div>
          </div>
        </section>
        <section class="wizard-step form-wide" data-step="3">
          <header><b>03</b><div><strong>起動方法を確認する</strong><small>通常は自動判別された値のままで起動できます。</small></div></header>
          <div class="wizard-fields">
            <label><span>LAUNCH TYPE</span><select name="launchType">${["exe","shortcut","python","powershell","bat","url","folder"].map(type => `<option value="${type}" ${launch.type === type ? "selected" : ""}>${type.toUpperCase()}</option>`).join("")}</select></label>
            <label class="switch-field"><span>ENABLE LAUNCH</span><input name="launchEnabled" type="checkbox" ${launch.enabled ? "checked" : ""}><i></i></label>
            <label class="form-wide path-field"><span>WORKING DIRECTORY</span><div><input name="workingDirectory" value="${escapeHtml(launch.workingDirectory || "")}" placeholder="空欄なら起動ファイルのフォルダー"><button type="button" data-action="browse-working">参照</button></div></label>
            <label class="form-wide"><span>ARGUMENTS</span><input name="args" value="${escapeHtml((launch.args || []).join(" "))}" placeholder="例: --mode production"></label>
            <label class="form-wide"><span>PYTHON INTERPRETER (optional)</span><input name="interpreter" value="${escapeHtml(launch.interpreter || "")}" placeholder="空欄ならNEXUSを起動したPython"></label>
          </div>
          ${existing && ["missing","invalid","warning"].includes(health.state) ? `<div class="tool-repair-box"><strong>${escapeHtml(toolHealthLabel(tool))}</strong><span>${escapeHtml(health.message || "起動先を確認してください。")}</span><button type="button" data-action="repair-tool" data-tool="${escapeHtml(tool.id)}">移動先を自動検索</button></div>` : ""}
        </section>
        <div class="tool-config-actions form-wide"><button type="button" data-action="save-tool-config">SAVE TOOL</button>${existing ? `<button type="button" data-action="launch-tool" data-tool="${tool.id}" ${toolLaunchConfigured(tool) ? "" : "disabled"}>TEST LAUNCH</button>` : ""}</div>
      </form>`;
    drawerLayer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  async function saveToolConfig() {
    const form = document.getElementById("toolConfigForm");
    if (!form) return;
    const data = new FormData(form);
    const id = String(data.get("id") || "").trim();
    const existing = tools.find(item => item.id === id);
    const tool = {
      ...(existing || {}),
      id,
      name: String(data.get("name") || "").trim(),
      short: existing?.short || String(data.get("name") || "").trim(),
      category: String(data.get("category") || "UTILITY").trim(),
      categoryKey: String(data.get("categoryKey") || existing?.categoryKey || "utility"),
      description: String(data.get("description") || "").trim(),
      image: String(data.get("image") || existing?.image || "assets/tools/model-interpreter.svg").trim(),
      bg: existing?.bg || "#2fb7cb",
      tag: existing?.tag || "#2fb7cb",
      files: existing?.files || 0,
      updated: existing?.updated || "未使用",
      status: existing?.status || "READY",
      version: existing?.version || "1.0.0",
      recentFiles: existing?.recentFiles || [],
      launch: {
        enabled: data.get("launchEnabled") === "on",
        type: String(data.get("launchType") || "exe"),
        target: String(data.get("target") || "").trim(),
        workingDirectory: String(data.get("workingDirectory") || "").trim(),
        args: String(data.get("args") || "").trim().match(/(?:[^\s"]+|"[^"]*")+/g)?.map(value => value.replace(/^"|"$/g, "")) || [],
        interpreter: String(data.get("interpreter") || "").trim()
      }
    };
    try {
      const payload = await apiRequest("/api/tools/save", { method: "POST", body: JSON.stringify({ tool }) });
      tools = payload.tools || tools;
      syncToolOrder();
      showToast("ツール設定を保存しました", tool.name);
      openTool(tool.id);
      if (state.route === "tools") renderFullTools();
      if (state.route === "home") renderHomeTools();
    } catch (error) { showToast("保存できませんでした", error.message); }
  }

  async function selectToolPath(mode, fieldName) {
    try {
      const payload = await apiRequest("/api/select-path", { method: "POST", body: JSON.stringify({ mode }) });
      const input = document.querySelector(`#toolConfigForm [name="${fieldName}"]`);
      if (input && payload.path) { input.value = payload.path; if (fieldName === "target") detectToolTarget(); }
    } catch (error) { showToast("パスを選択できませんでした", error.message); }
  }

  async function detectToolTarget() {
    const form = document.getElementById("toolConfigForm");
    if (!form) return;
    const target = form.elements.target?.value?.trim();
    const status = document.getElementById("toolDetectStatus");
    if (!target) { showToast("起動先を指定してください", "ファイル、ショートカット、URL、またはフォルダーを選択します。"); return; }
    if (status) status.textContent = "判別中...";
    try {
      const payload = await apiRequest("/api/tool/detect", { method:"POST", body:JSON.stringify({ target }) });
      const value = payload.detected || {};
      const set = (name, val, overwrite = true) => { const field = form.elements[name]; if (field && val !== undefined && (overwrite || !field.value.trim())) field.value = Array.isArray(val) ? val.join(" ") : val; };
      set("launchType", value.type);
      set("workingDirectory", value.workingDirectory);
      set("name", value.name, !tools.some(tool => tool.id === form.dataset.toolId));
      set("category", value.category, !form.elements.category.value || form.elements.category.value === "UTILITY");
      set("categoryKey", value.categoryKey);
      set("description", value.description, !form.elements.description.value || form.elements.description.value.includes("説明を入力"));
      set("args", value.args || []);
      if (!tools.some(tool => tool.id === form.dataset.toolId)) {
        const slug = String(value.name || "tool").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,28) || `tool-${Date.now().toString(36)}`;
        set("id", slug);
      }
      if (form.elements.launchEnabled) form.elements.launchEnabled.checked = true;
      if (status) status.textContent = `${String(value.type || "").toUpperCase()}として判別しました。${value.resolvedTarget ? " ショートカットの実体も確認済みです。" : ""}`;
      showToast("起動方式を自動判別しました", String(value.type || "").toUpperCase());
    } catch (error) { if (status) status.textContent = error.message; showToast("自動判別できませんでした", error.message); }
  }

  async function importToolImage() {
    try {
      const payload = await apiRequest("/api/tool/import-image", { method:"POST", body:"{}" });
      const form = document.getElementById("toolConfigForm");
      if (form?.elements.image && payload.url) form.elements.image.value = payload.url;
      const preview = document.getElementById("toolWizardPreview");
      if (preview && payload.url) preview.src = payload.url;
      showToast("プレビュー画像を登録しました", "NEXUSのユーザーデータへコピーしました。");
    } catch (error) { showToast("画像を登録できませんでした", error.message); }
  }

  async function repairToolPath(toolId) {
    if (!toolId) return;
    showToast("移動先を検索します", "検索する親フォルダーを選択してください。");
    try {
      const payload = await apiRequest("/api/tool/repair", { method:"POST", body:JSON.stringify({ toolId }) });
      tools = payload.tools || tools;
      showToast("起動先を修復しました", payload.tool?.launch?.target || "");
      openToolEditor(toolId);
      if (state.route === "tools") renderFullTools();
    } catch (error) { showToast("起動先を修復できませんでした", error.message); }
  }

  async function restoreWorkspaceBackup() {
    if (!window.confirm("現在の設定を安全バックアップしてから、選択したバックアップへ復元します。続行しますか？")) return;
    try {
      const payload = await apiRequest("/api/restore", { method:"POST", body:"{}" });
      await loadWorkspaceData();
      renderRoute();
      showToast("バックアップを復元しました", `復元前の安全バックアップ: ${payload.safetyBackup || "作成済み"}`);
    } catch (error) { showToast("復元できませんでした", error.message); }
  }

  async function launchRegisteredTool(toolId) {
    const tool = tools.find(item => item.id === toolId);
    if (!tool) return;
    state.loadingToolId = toolId;
    openTool(toolId);
    try {
      const payload = await apiRequest("/api/launch", { method: "POST", body: JSON.stringify({ toolId }) });
      if (payload.result && !payload.result.alreadyRunning) state.launchHistory.unshift(payload.result);
      state.processes = Array.isArray(payload.processes) ? payload.processes : state.processes;
      if (payload.result?.alreadyRunning) showToast("すでに起動中です", payload.result.focused ? "既存ウィンドウを前面へ移動しました。" : `PID ${payload.result.pid}`);
      else showToast("ツールを起動しました", payload.result?.pid ? `PID ${payload.result.pid}` : payload.result?.message || tool.name);
    } catch (error) {
      state.launchHistory.unshift({ toolId, toolName: tool.name, startedAt: new Date().toISOString(), success: false, message: error.message });
      showToast("起動できませんでした", error.message);
    } finally {
      state.loadingToolId = null;
      openTool(toolId);
      if (state.route === "home") { renderHomeTools(); renderWorkspacePulse(); }
      if (state.route === "tools") renderFullTools();
      updateNotificationBadge();
    }
  }

  async function focusRegisteredTool(toolId) {
    try {
      const payload = await apiRequest("/api/process/focus", { method: "POST", body: JSON.stringify({ toolId }) });
      showToast(payload.focused ? "ウィンドウを前面へ移動しました" : "アプリは起動中です", payload.focused ? `PID ${payload.pid}` : "タスクバーから選択してください。");
    } catch (error) { showToast("前面化できませんでした", error.message); }
  }

  async function stopRegisteredTool(toolId) {
    const tool = tools.find(item => item.id === toolId);
    if (!window.confirm(`${tool?.name || toolId} を停止しますか？`)) return;
    try {
      const payload = await apiRequest("/api/process/stop", { method: "POST", body: JSON.stringify({ toolId }) });
      state.processes = payload.processes || [];
      showToast("アプリを停止しました", tool?.name || toolId);
      openTool(toolId);
      if (state.route === "home") { renderHomeTools(); renderWorkspacePulse(); }
      if (state.route === "tools") renderFullTools();
      if (state.route === "projects") renderProjectWorkspace();
      if (state.route === "settings") renderBridgeSettings();
      updateNotificationBadge();
    } catch (error) { showToast("停止できませんでした", error.message); }
  }

  async function refreshProcesses(silent = true) {
    if (!state.bridgeOnline) return;
    try {
      const payload = await apiRequest("/api/processes");
      const before = JSON.stringify(state.processes.map(item => [item.toolId,item.pid]));
      state.processes = payload.processes || [];
      const after = JSON.stringify(state.processes.map(item => [item.toolId,item.pid]));
      if (before !== after) {
        if (state.route === "home") { renderHomeTools(); renderWorkspacePulse(); }
        if (state.route === "tools") renderFullTools();
        if (state.route === "projects") renderProjectWorkspace();
        if (state.route === "settings") renderBridgeSettings();
        updateNotificationBadge();
      }
    } catch (error) {
      if (!silent) showToast("実行状態を更新できませんでした", error.message);
    }
  }

  async function addToolToProject(toolId, projectId = state.activeProjectId || projects[0]?.id || "hts") {
    try {
      const payload = await apiRequest("/api/project-tools", { method: "POST", body: JSON.stringify({ projectId, toolId, action: "add" }) });
      projects = payload.projects || projects;
      if (state.route === "projects") { renderProjectSwitcher(); renderProjectWorkspace(); renderAtlas(); }
      if (state.route === "home") renderHomeProjects();
      showToast("プロジェクトへ追加しました", payload.project?.name || projectId);
    } catch (error) { showToast("追加できませんでした", error.message); }
  }

  function openProjectResourceEditor(mode = "file", projectId = state.activeProjectId || projects[0]?.id || "") {
    const project = projects.find(item => item.id === projectId) || projects[0];
    if (!project) { showToast("プロジェクトがありません", "先にProject Atlasでプロジェクトを作成してください。"); return; }
    const safeMode = ["file","folder","url"].includes(mode) ? mode : "file";
    detailDrawer.innerHTML = `
      <div class="drawer-editor-head"><span>PROJECT RESOURCE / v1.20.0</span><h2>ADD FILE / FOLDER</h2><button class="drawer-close" data-close-drawer aria-label="閉じる">×</button></div>
      <form class="tool-config-form resource-editor-form" id="resourceEditorForm">
        <label class="form-wide"><span>PROJECT</span><select name="projectId">${projects.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === project.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label>
        <label><span>TYPE</span><select name="mode" id="resourceMode"><option value="file" ${safeMode === "file" ? "selected" : ""}>FILE</option><option value="folder" ${safeMode === "folder" ? "selected" : ""}>FOLDER</option><option value="url" ${safeMode === "url" ? "selected" : ""}>URL</option></select></label>
        <label><span>KIND</span><select name="kind"><option value="reference">REFERENCE</option><option value="output">OUTPUT</option><option value="data">DATA</option><option value="folder">WORKSPACE</option></select></label>
        <label class="form-wide"><span>LABEL</span><input name="label" placeholder="表示名（空欄ならファイル名）"></label>
        <label class="form-wide path-field"><span>PATH / URL</span><div><input name="path" placeholder="ファイル、フォルダー、またはURL"><button type="button" data-action="browse-resource">参照</button></div></label>
        <p class="form-wide resource-editor-help">ファイル自体はNEXUSへコピーせず、現在の保存場所へのリンクとして登録します。</p>
        <div class="tool-config-actions form-wide"><button type="button" data-action="save-project-resource">REGISTER RESOURCE</button></div>
      </form>`;
    drawerLayer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  async function browseProjectResource() {
    const form = document.getElementById("resourceEditorForm");
    if (!form) return;
    const mode = String(new FormData(form).get("mode") || "file");
    if (mode === "url") { form.elements.path.focus(); return; }
    try {
      const payload = await apiRequest("/api/select-path", { method:"POST", body:JSON.stringify({ mode: mode === "file" ? "resource" : mode }) });
      if (payload.path) form.elements.path.value = payload.path;
    } catch (error) { showToast("選択できませんでした", error.message); }
  }

  async function saveProjectResource() {
    const form = document.getElementById("resourceEditorForm");
    if (!form) return;
    const data = new FormData(form);
    try {
      const payload = await apiRequest("/api/project-resource/add", { method:"POST", body:JSON.stringify({
        projectId: String(data.get("projectId") || ""),
        mode: String(data.get("mode") || "file"),
        kind: String(data.get("kind") || "reference"),
        label: String(data.get("label") || "").trim(),
        path: String(data.get("path") || "").trim()
      }) });
      projects = payload.projects || projects;
      state.activeProjectId = String(data.get("projectId") || state.activeProjectId);
      safeStorage.setItem("nexusActiveProject", state.activeProjectId);
      closeDrawer();
      if (state.route === "projects") renderProjects();
      if (state.route === "home") { renderHomeProjects(); renderWorkspacePulse(); }
      updateNotificationBadge();
      showToast("資料を登録しました", payload.resource?.label || "Project resource");
    } catch (error) { showToast("登録できませんでした", error.message); }
  }

  async function openResource(resourceId) {
    const found = resourceById(resourceId);
    if (!found) { showToast("資料が見つかりません", resourceId); return; }
    try {
      await apiRequest("/api/open-path", { method:"POST", body:JSON.stringify({ path: found.resource.path }) });
      showToast("開きました", found.resource.label);
    } catch (error) { showToast("開けませんでした", error.message); }
  }

  async function removeProjectResource(resourceId) {
    const found = resourceById(resourceId);
    if (!found) return;
    if (!window.confirm(`「${found.resource.label}」の登録を解除しますか？\n元のファイルは削除されません。`)) return;
    try {
      const payload = await apiRequest("/api/project-resource/remove", { method:"POST", body:JSON.stringify({ projectId: found.project.id, resourceId }) });
      projects = payload.projects || projects;
      if (state.route === "projects") renderProjects();
      if (state.route === "home") { renderHomeProjects(); renderWorkspacePulse(); }
      updateNotificationBadge();
      showToast("登録を解除しました", found.resource.label);
    } catch (error) { showToast("解除できませんでした", error.message); }
  }

  function showRuntimeDrawer() {
    detailDrawer.innerHTML = `
      <div class="drawer-editor-head"><span>LIVE PROCESSES / v1.20.0</span><h2>RUNNING TOOLS</h2><button class="drawer-close" data-close-drawer aria-label="閉じる">×</button></div>
      <div class="runtime-drawer">${state.processes.length ? state.processes.map(item => `<div class="running-process-row"><span class="running-pulse"></span><strong>${escapeHtml(item.toolName || item.toolId)}</strong><small>PID ${item.pid}</small><button data-action="focus-tool" data-tool="${escapeHtml(item.toolId)}">FOCUS</button><button class="danger-action" data-action="stop-tool" data-tool="${escapeHtml(item.toolId)}">STOP</button></div>`).join("") : '<div class="attention-clear"><strong>NO RUNNING TOOLS</strong><p>NEXUSから起動したアプリはありません。</p></div>'}</div>`;
    drawerLayer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawerLayer.hidden = true;
    document.body.style.overflow = "";
  }

  function openCommand(query = "") {
    commandLayer.hidden = false;
    document.body.style.overflow = "hidden";
    commandInput.value = query;
    renderCommandResults(query);
    requestAnimationFrame(() => commandInput.focus());
  }

  function closeCommand() {
    commandLayer.hidden = true;
    document.body.style.overflow = "";
  }

  function renderCommandResults(query) {
    const q = query.trim().toLowerCase();
    const items = [
      ...tools.map(tool => ({ type: "tool", id: tool.id, title: tool.name, subtitle: `${tool.category} · ${tool.description}`, icon: "+", color: tool.tag })),
      ...projects.map(project => ({ type: "project", id: project.id, title: project.name, subtitle: `${project.subtitle || ""} ${project.nextAction || ""}`, icon: project.icon, color: project.color })),
      ...notes.map(note => ({ type: "note", id: note.id, title: note.title, subtitle: `${note.tag || "NOTE"} · ${note.body}`, icon: "✎", color: note.color })),
      ...allResources().map(resource => ({ type: "resource", id: resource.id, title: resource.label, subtitle: `${resource.projectName} · ${resource.path}`, icon: resource.type === "folder" ? "▰" : "▤", color: resource.projectColor || "#f3bf31" })),
      ...navItems.slice(0,4).map(([route, icon, label]) => ({ type: "route", id: route, title: `${label}へ移動`, subtitle: "Navigation", icon, color: "#171512" }))
    ].filter(item => !q || `${item.title} ${item.subtitle}`.toLowerCase().includes(q)).slice(0, 16);
    commandResults.innerHTML = items.length ? items.map((item, index) => `
      <button class="command-result ${index === 0 ? "active" : ""}" data-command-type="${item.type}" data-command-id="${item.id}" style="--result-color:${item.color}">
        <i>${item.icon}</i><span><strong>${item.title}</strong><small>${item.subtitle}</small></span><kbd>↵</kbd>
      </button>`).join("") : '<div class="command-empty">見つかりませんでした。別の言葉で検索してください。</div>';
  }

  function executeCommand(type, id) {
    closeCommand();
    if (type === "tool") openTool(id);
    else if (type === "project") { state.activeProjectId = id; safeStorage.setItem("nexusActiveProject", id); navigate("projects"); showToast("プロジェクトを表示しました", projects.find(p => p.id === id)?.name || ""); }
    else if (type === "note") { navigate("notes"); window.setTimeout(() => openNoteEditor(id), 80); }
    else if (type === "resource") openResource(id);
    else if (type === "route") navigate(id);
  }

  function createInkBurst(x, y) {
    const burst = document.createElement("span");
    burst.className = "ink-burst";
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 650);
  }

  function showToast(title, message = "") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${title}</strong>${message ? `<small>${message}</small>` : ""}`;
    toastRegion.appendChild(toast);
    setTimeout(() => toast.remove(), 3800);
  }

  function handleAction(action, element) {
    switch (action) {
      case "new-project": openProjectEditor(); break;
      case "search": openCommand(); break;
      case "new-note": openNoteEditor(); break;
      case "recent-tool": { const id = recentToolIds()[0]; if (id) openTool(id); else navigate("tools"); break; }
      case "add-resource": openProjectResourceEditor("file"); break;
      case "open-active-project": navigate("projects"); break;
      case "show-runtime": showRuntimeDrawer(); break;
      case "show-attention": openAttentionDrawer(); break;
      case "add-project-file": openProjectResourceEditor("file"); break;
      case "add-project-folder": openProjectResourceEditor("folder"); break;
      case "browse-resource": browseProjectResource(); break;
      case "save-project-resource": saveProjectResource(); break;
      case "open-file": openProjectResourceEditor("file"); break;
      case "create-link": openProjectResourceEditor("url"); break;
      case "add-tool": openToolEditor(); break;
      case "random-prompt": {
        const prompts = ["この作業を半分にする道具は作れないか？", "今見えていない前提は何か？", "失敗を再利用できる形で残せているか？", "説明文を読まずに機能が伝わるか？"];
        showToast("QUESTION EVERYTHING", prompts[Math.floor(Math.random() * prompts.length)]);
        break;
      }
      case "cycle-hero":
        state.heroIndex = (state.heroIndex + 1) % heroSlides.length;
        applyHeroSlide(true);
        break;
      case "atlas-reset": resetAtlas(); break;
      case "atlas-zoom-in": zoomAtlas(1.12); break;
      case "atlas-zoom-out": zoomAtlas(.89); break;
      case "reset-preferences": resetPreferences(); break;
      case "replay-intro": replayPaintedIntro(); break;
      case "launch-tool": launchRegisteredTool(element.dataset.tool); break;
      case "focus-tool": focusRegisteredTool(element.dataset.tool); break;
      case "stop-tool": stopRegisteredTool(element.dataset.tool); break;
      case "configure-tool": openToolEditor(element.dataset.tool); break;
      case "save-tool-config": saveToolConfig(); break;
      case "save-note": saveNote(); break;
      case "delete-note": deleteNote(element.dataset.note); break;
      case "save-project": saveProject(); break;
      case "edit-project": openProjectEditor(element.dataset.project); break;
      case "browse-target": selectToolPath("file", "target"); break;
      case "browse-working": selectToolPath("folder", "workingDirectory"); break;
      case "detect-tool": detectToolTarget(); break;
      case "import-tool-image": importToolImage(); break;
      case "repair-tool": repairToolPath(element.dataset.tool); break;
      case "open-data-folder": apiRequest("/api/open-data-folder", { method:"POST", body:"{}" }).catch(error => showToast("開けませんでした", error.message)); break;
      case "refresh-runtime": loadWorkspaceData().then(() => { renderBridgeSettings(); showToast("Launch Bridgeを更新しました", "設定・履歴・実行状態を再読み込みしました。"); }); break;
      case "create-backup": apiRequest("/api/backup", { method:"POST", body:"{}" }).then(payload => showToast("バックアップを作成しました", payload.path || "")).catch(error => showToast("作成できませんでした", error.message)); break;
      case "restore-backup": restoreWorkspaceBackup(); break;
      case "open-backup-folder": apiRequest("/api/open-backup-folder", { method:"POST", body:"{}" }).catch(error => showToast("開けませんでした", error.message)); break;
      case "add-to-project": addToolToProject(element.dataset.tool); break;
      default: break;
    }
  }

  function toggleMotion() {
    state.motionReduced = !state.motionReduced;
    safeStorage.setItem("nexusMotionReduced", String(state.motionReduced));
    applyPreferences();
    showToast(state.motionReduced ? "モーションを抑えました" : "モーションを有効にしました", state.motionReduced ? "静かな表示へ切り替えました。" : "ホバーと画面遷移が動きます。");
    if (state.route === "home") { stopHeroTimer(); renderHero(); }
  }

  document.addEventListener("click", event => {
    if (state.inkBurst && !state.motionReduced && state.motionLevel > 0 && event.button === 0) createInkBurst(event.clientX, event.clientY);

    const density = event.target.closest("button[data-density]")?.dataset.density;
    if (density) {
      state.density = density;
      safeStorage.setItem("nexusDensity", density);
      applyPreferences();
      updateSettingsControls();
      return;
    }
    const accent = event.target.closest("button[data-accent]")?.dataset.accent;
    if (accent) {
      state.accent = accent;
      safeStorage.setItem("nexusAccent", accent);
      applyPreferences();
      updateSettingsControls();
      return;
    }

    const route = event.target.closest("[data-route]")?.dataset.route;
    if (route) { event.preventDefault(); navigate(route); return; }

    const toolId = event.target.closest("[data-open-tool]")?.dataset.openTool;
    if (toolId) { event.stopPropagation(); openTool(toolId); return; }

    const resourceId = event.target.closest("[data-open-resource]")?.dataset.openResource;
    if (resourceId) { event.stopPropagation(); openResource(resourceId); return; }

    const removeResourceId = event.target.closest("[data-remove-resource]")?.dataset.removeResource;
    if (removeResourceId) { event.stopPropagation(); removeProjectResource(removeResourceId); return; }

    const card = event.target.closest(".tool-card");
    if (card && !event.target.closest("button") && !state.justDragged) { openTool(card.dataset.toolId); return; }

    const actionElement = event.target.closest("[data-action]");
    if (actionElement) { handleAction(actionElement.dataset.action, actionElement); return; }

    const closeDrawerElement = event.target.closest("[data-close-drawer]");
    if (closeDrawerElement) { closeDrawer(); return; }

    if (event.target.closest("[data-close-command]")) { closeCommand(); return; }

    const heroIndex = event.target.closest("[data-hero-index]")?.dataset.heroIndex;
    if (heroIndex !== undefined) { state.heroIndex = Number(heroIndex); applyHeroSlide(true); return; }

    const heroAction = event.target.closest("[data-hero-action]")?.dataset.heroAction;
    if (heroAction) {
      const messages = { explore: "問いをProject Atlasへ送ります。", connect: "関連ツールを検索します。", create: "新しい成果物の作成を開始します。" };
      document.getElementById("ideaRing")?.classList.add("active");
      const heroCanvas = document.querySelector(".live-collage-hero");
      heroCanvas?.classList.remove("hero-action-pulse");
      void heroCanvas?.offsetWidth;
      heroCanvas?.classList.add("hero-action-pulse");
      setTimeout(() => {
        document.getElementById("ideaRing")?.classList.remove("active");
        heroCanvas?.classList.remove("hero-action-pulse");
      }, 520);
      showToast(heroAction.toUpperCase(), messages[heroAction]);
      return;
    }

    const filter = event.target.closest("[data-tool-filter]")?.dataset.toolFilter;
    if (filter) { state.toolFilter = filter; document.querySelectorAll("[data-tool-filter]").forEach(button => button.classList.toggle("active", button.dataset.toolFilter === filter)); renderFullTools(); return; }

    const noteFilter = event.target.closest("[data-note-filter]")?.dataset.noteFilter;
    if (noteFilter) { state.noteFilter = noteFilter; renderNoteBoard(); return; }

    const editNoteId = event.target.closest("[data-edit-note]")?.dataset.editNote;
    if (editNoteId) { openNoteEditor(editNoteId); return; }

    const deleteNoteId = event.target.closest("[data-delete-note]")?.dataset.deleteNote;
    if (deleteNoteId) { deleteNote(deleteNoteId); return; }

    const pinId = event.target.closest("[data-toggle-pin]")?.dataset.togglePin;
    if (pinId) { persistPin(pinId); return; }

    const command = event.target.closest("[data-command-type]");
    if (command) { executeCommand(command.dataset.commandType, command.dataset.commandId); return; }

    const selectedProjectId = event.target.closest("[data-select-project]")?.dataset.selectProject;
    if (selectedProjectId) {
      state.activeProjectId = selectedProjectId;
      safeStorage.setItem("nexusActiveProject", selectedProjectId);
      resetAtlas();
      renderProjectSwitcher();
      renderProjectWorkspace();
      renderAtlas();
      return;
    }

    const projectId = event.target.closest("[data-project-id]")?.dataset.projectId;
    if (projectId) {
      state.activeProjectId = projectId;
      safeStorage.setItem("nexusActiveProject", projectId);
      navigate("projects");
      showToast("Project Atlas", projects.find(project => project.id === projectId)?.name || "");
      return;
    }
  });

  document.getElementById("openSearch").addEventListener("click", () => openCommand());
  document.getElementById("motionToggle").addEventListener("click", toggleMotion);
  document.getElementById("mobileMenu").addEventListener("click", () => appShell.classList.toggle("menu-open"));
  document.getElementById("notificationButton").addEventListener("click", openAttentionDrawer);
  document.getElementById("helpButton").addEventListener("click", () => navigate("guide"));
  document.getElementById("profileButton").addEventListener("click", () => showToast("Researcher", "NEXUS ID: 0427 / Local workspace"));

  commandInput.addEventListener("input", event => renderCommandResults(event.target.value));
  commandInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const active = commandResults.querySelector(".command-result.active") || commandResults.querySelector(".command-result");
      if (active) executeCommand(active.dataset.commandType, active.dataset.commandId);
    }
  });

  window.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openCommand(); }
    if (event.key === "Escape") { if (!commandLayer.hidden) closeCommand(); else if (!drawerLayer.hidden) closeDrawer(); else appShell.classList.remove("menu-open"); }
    if (!event.ctrlKey && !event.metaKey && !event.altKey && document.activeElement?.tagName !== "INPUT") {
      if (event.key === "1") navigate("home");
      if (event.key === "2") navigate("tools");
      if (event.key === "3") navigate("projects");
      if (event.key === "4") navigate("notes");
      if (event.key === "5") navigate("guide");
      if (event.key === "6") navigate("settings");
    }
  });

  window.addEventListener("hashchange", () => {
    const next = location.hash.replace("#", "") || "home";
    if (next !== state.route) { state.route = next; renderNav(); renderRoute(); }
  });

  const paintedIntro = document.getElementById("paintedIntro");
  const introStart = document.getElementById("introStart");
  const introSkip = document.getElementById("introSkip");
  const introSound = document.getElementById("introSound");
  const introVideo = document.getElementById("introVideo");
  const introProgress = document.getElementById("introProgress");
  const introModeBadge = document.getElementById("introModeBadge");
  let introDismissed = false;
  let introAutoExitTimer = null;
  let introFailureTimer = null;
  let introWatchdogTimer = null;
  let introPlaybackStart = 0;
  let introPlaybackMode = state.startupIntroMode;
  let introSeenMarked = false;
  let lastIntroTimeUpdate = 0;

  function clearIntroTimers() {
    if (introAutoExitTimer) window.clearTimeout(introAutoExitTimer);
    if (introFailureTimer) window.clearTimeout(introFailureTimer);
    if (introWatchdogTimer) window.clearTimeout(introWatchdogTimer);
    introAutoExitTimer = null;
    introFailureTimer = null;
    introWatchdogTimer = null;
  }

  function markIntroSeen() {
    if (introSeenMarked || introPlaybackMode === "off") return;
    introSeenMarked = true;
    const count = Math.max(0, Number(safeStorage.getItem("nexusIntroSeenCount") || 0));
    safeStorage.setItem("nexusIntroSeenCount", String(count + 1));
  }

  function setIntroProgress(value) {
    if (introProgress) introProgress.style.transform = `scaleX(${Math.max(0, Math.min(1, value))})`;
  }

  function syncIntroModeBadge() {
    if (!introModeBadge) return;
    introModeBadge.textContent = introPlaybackMode === "quick" ? "QUICK CUT" : "FULL FILM";
  }

  function syncIntroSoundControl() {
    if (!introSound || !introVideo) return;
    const enabled = !introVideo.muted;
    introSound.textContent = enabled ? "SOUND ON" : "SOUND OFF";
    introSound.setAttribute("aria-pressed", String(enabled));
  }

  function setOpeningReady(autoExit = true) {
    if (!paintedIntro || introDismissed) return;
    clearIntroTimers();
    paintedIntro.classList.remove("intro-awaiting", "intro-manual-exit", "intro-fallback");
    paintedIntro.classList.add("intro-ready");
    setIntroProgress(1);
    if (autoExit) {
      introAutoExitTimer = window.setTimeout(() => dismissPaintedIntro(state.motionReduced), state.motionReduced ? 80 : 220);
    }
  }

  function waitForVideoMetadata(timeout = 2200) {
    if (!introVideo) return Promise.reject(new Error("video element missing"));
    if (introVideo.readyState >= 1 && Number.isFinite(introVideo.duration)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        introVideo.removeEventListener("loadedmetadata", onReady);
        introVideo.removeEventListener("error", onError);
        ok ? resolve() : reject(new Error("opening film metadata unavailable"));
      };
      const onReady = () => finish(true);
      const onError = () => finish(false);
      const timer = window.setTimeout(() => finish(false), timeout);
      introVideo.addEventListener("loadedmetadata", onReady, { once: true });
      introVideo.addEventListener("error", onError, { once: true });
      introVideo.load();
    });
  }

  function armIntroWatchdog() {
    if (introWatchdogTimer) window.clearTimeout(introWatchdogTimer);
    introWatchdogTimer = window.setTimeout(() => {
      if (!introDismissed && introVideo && !introVideo.ended && performance.now() - lastIntroTimeUpdate > 4200) {
        failOpeningFilm("再生が停止したためHomeへ移動しました。");
      }
    }, 4600);
  }

  function failOpeningFilm(message = "起動映像を読み込めなかったためHomeへ移動しました。") {
    if (!paintedIntro || introDismissed) return;
    clearIntroTimers();
    paintedIntro.classList.add("intro-fallback");
    if (message) console.warn(message);
    introFailureTimer = window.setTimeout(() => dismissPaintedIntro(true), 80);
  }

  async function playOpeningFilm(mode = state.startupIntroMode) {
    if (!paintedIntro || !introVideo || introDismissed) return;
    clearIntroTimers();
    introPlaybackMode = ["full", "quick"].includes(mode) ? mode : "full";
    syncIntroModeBadge();
    paintedIntro.classList.remove("intro-ready", "intro-exit", "intro-manual-exit", "intro-awaiting", "intro-fallback");
    paintedIntro.classList.add("intro-loading");
    paintedIntro.classList.remove("intro-frame-ready");
    setIntroProgress(0);

    if (state.motionReduced) {
      setOpeningReady(true);
      return;
    }

    try {
      await waitForVideoMetadata();
      const duration = Number.isFinite(introVideo.duration) ? introVideo.duration : 0;
      introPlaybackStart = introPlaybackMode === "quick" && duration > 4.2 ? Math.max(0, duration - 3.9) : 0;
      introVideo.currentTime = introPlaybackStart;
      introVideo.volume = 0.68;
      markIntroSeen();
      lastIntroTimeUpdate = performance.now();
      introFailureTimer = window.setTimeout(() => {
        if (!introDismissed && introVideo.paused && !paintedIntro.classList.contains("intro-awaiting")) failOpeningFilm();
      }, 4800);
      await introVideo.play();
      paintedIntro.classList.remove("intro-loading");
      armIntroWatchdog();
    } catch (_) {
      clearIntroTimers();
      paintedIntro.classList.remove("intro-loading");
      paintedIntro.classList.add("intro-awaiting");
    }
  }

  function replayPaintedIntro() {
    if (!paintedIntro) return;
    clearIntroTimers();
    introDismissed = false;
    introSeenMarked = true;
    paintedIntro.hidden = false;
    paintedIntro.classList.remove("intro-exit", "intro-manual-exit", "intro-ready", "intro-awaiting", "intro-fallback", "intro-loading");
    document.documentElement.classList.remove("intro-off");
    document.body.classList.add("intro-active");
    void paintedIntro.offsetWidth;
    playOpeningFilm("full");
  }

  function dismissPaintedIntro(manual = false) {
    if (!paintedIntro || introDismissed) return;
    introDismissed = true;
    clearIntroTimers();
    introVideo?.pause();
    paintedIntro.classList.remove("intro-awaiting", "intro-loading", "intro-frame-ready");
    paintedIntro.classList.add(manual ? "intro-manual-exit" : "intro-exit");
    document.body.classList.remove("intro-active");
    const wait = state.motionReduced ? 140 : manual ? 300 : 760;
    window.setTimeout(() => {
      paintedIntro.hidden = true;
      paintedIntro.classList.remove("intro-exit", "intro-manual-exit", "intro-ready", "intro-fallback");
      document.documentElement.classList.remove("intro-off");
      document.getElementById("openSearch")?.focus({ preventScroll: true });
    }, wait);
  }

  if (!state.showIntro && paintedIntro) {
    paintedIntro.hidden = true;
    document.documentElement.classList.add("intro-off");
    document.body.classList.remove("intro-active");
    introDismissed = true;
  }

  if (introVideo) {
    introVideo.muted = true;
    introVideo.volume = 0.68;
  }
  syncIntroSoundControl();
  syncIntroModeBadge();

  introVideo?.addEventListener("ended", () => setOpeningReady(true));
  introVideo?.addEventListener("playing", () => {
    if (introFailureTimer) window.clearTimeout(introFailureTimer);
    introFailureTimer = null;
    paintedIntro?.classList.remove("intro-loading", "intro-awaiting");
    paintedIntro?.classList.add("intro-frame-ready");
    lastIntroTimeUpdate = performance.now();
    armIntroWatchdog();
  });
  introVideo?.addEventListener("error", () => failOpeningFilm());
  introVideo?.addEventListener("stalled", armIntroWatchdog);
  introVideo?.addEventListener("waiting", armIntroWatchdog);
  introVideo?.addEventListener("timeupdate", () => {
    if (!introVideo?.duration || introDismissed) return;
    lastIntroTimeUpdate = performance.now();
    if (introVideo.currentTime >= introPlaybackStart + 0.035) paintedIntro?.classList.add("intro-frame-ready");
    armIntroWatchdog();
    const segmentLength = Math.max(0.001, introVideo.duration - introPlaybackStart);
    setIntroProgress((introVideo.currentTime - introPlaybackStart) / segmentLength);
  });
  introVideo?.addEventListener("click", () => {
    if (paintedIntro?.classList.contains("intro-awaiting")) playOpeningFilm(introPlaybackMode);
  });

  if (paintedIntro && !paintedIntro.hidden && state.showIntro) playOpeningFilm(state.startupIntroMode);
  introStart?.addEventListener("click", () => playOpeningFilm(introPlaybackMode));
  introSkip?.addEventListener("click", () => dismissPaintedIntro(true));
  introSound?.addEventListener("click", async () => {
    if (!introVideo || introDismissed) return;
    introVideo.muted = !introVideo.muted;
    syncIntroSoundControl();
    if (introVideo.paused && !paintedIntro?.classList.contains("intro-ready")) {
      try { await introVideo.play(); } catch (_) { paintedIntro?.classList.add("intro-awaiting"); }
    }
  });
  window.addEventListener("keydown", event => {
    if (!paintedIntro || paintedIntro.hidden || introDismissed) return;
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      event.preventDefault();
      dismissPaintedIntro(true);
    }
  }, { capture: true });

  async function initialize() {
    applyPreferences();
    await loadWorkspaceData();
    renderNav();
    renderRoute();
    updateNotificationBadge();
    window.setInterval(() => refreshProcesses(true), 3500);
  }

  initialize();
})();
