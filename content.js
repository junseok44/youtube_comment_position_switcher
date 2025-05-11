let isCommentViewerActive = false;

// 유효한 secondary/primary 선택자
function getActiveSecondary() {
  const columns = document.querySelector("#columns");
  if (!columns) return null;
  return columns.querySelector("#secondary");
}

function getActivePrimary() {
  const columns = document.querySelector("#columns");
  if (!columns) return null;
  return columns.querySelector("#primary");
}

function waitForElement(selector, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(timer);
        resolve(element);
      } else if ((elapsed += intervalTime) >= timeout) {
        clearInterval(timer);
        reject(new Error(`Timeout: ${selector} not found`));
      }
    }, intervalTime);
  });
}

function getBelowContainer() {
  return document.querySelector("#below");
}

// URL이 동영상 페이지인지 확인
function isVideoPage() {
  return (
    window.location.pathname === "/watch" &&
    window.location.search.includes("v=")
  );
}

// localStorage에서 상태 복원
function restoreCommentViewerState() {
  if (isCommentViewerActive) return; // 중복 실행 방지

  const savedState = localStorage.getItem("commentViewerActive");

  if (savedState === null) {
    localStorage.setItem("commentViewerActive", "true");
    isCommentViewerActive = true;
    activateCommentViewer();
  } else if (savedState === "true") {
    isCommentViewerActive = true;
    activateCommentViewer();
  }
}

function startCommentViewer() {
    setTimeout(() => {
      restoreCommentViewerState();
    }, 1000);
}

// 최초 진입 시 처리
if (isVideoPage()) {
  startCommentViewer();
}

// URL 변경 감지
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;

    if (isVideoPage()) {
      startCommentViewer();
    }
  }
});
observer.observe(document, { subtree: true, childList: true });

// 메시지 수신
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleComments" && isVideoPage()) {
    if (isCommentViewerActive) {
      deactivateCommentViewer();
    } else {
      activateCommentViewer();
    }
    isCommentViewerActive = !isCommentViewerActive;
    localStorage.setItem("commentViewerActive", isCommentViewerActive);
  }
});

// 댓글 뷰어 초기화 (필요 시)
function initializeCommentViewer() {
  const commentsSection = document.querySelector("#comments");
  const secondaryContainer = getActiveSecondary();
  const primaryContainer = getActivePrimary();

  if (!commentsSection || !secondaryContainer) return;

  secondaryContainer.innerHTML = "";
  secondaryContainer.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100vh;
    overflow-y: auto;
    background: white;
    z-index: 1000;
    padding: 20px;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  `;

  secondaryContainer.appendChild(commentsSection);
  commentsSection.style.cssText = `
    max-height: calc(100vh - 40px);
    overflow-y: auto;
  `;

  if (primaryContainer) {
    primaryContainer.style.marginRight = "420px";
  }
}

function activateCommentViewer() {
  const commentsSection = document.querySelector("#comments");
  const secondaryContainer = getActiveSecondary();
  const relatedVideos = document.querySelector("#secondary-inner");
  const belowContainer = getBelowContainer();

  if (!commentsSection || !secondaryContainer || !relatedVideos || !belowContainer)
    return;

  // 관련 동영상 이동
  if (secondaryContainer.contains(relatedVideos)) {
    belowContainer.appendChild(relatedVideos);
  }

  // 댓글 이동
  if (belowContainer.contains(commentsSection)) {
    secondaryContainer.appendChild(commentsSection);
  }

  // 스타일
  secondaryContainer.style.cssText = `
    width: 400px;
    background: transparent;
    padding: 20px;
  `;

  commentsSection.style.cssText = `
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  `;
  commentsSection.classList.add("ytd-comments");

  const commentItems = commentsSection.querySelectorAll("ytd-comment-thread-renderer");
  commentItems.forEach((item) => {
    item.style.cssText = "";
    item.classList.add("style-scope", "ytd-item-section-renderer");

    const commentContent = item.querySelector("#content-text");
    if (commentContent) {
      commentContent.style.color = "inherit";
    }

    const commentBody = item.querySelector("#body");
    if (commentBody) {
      commentBody.style.backgroundColor = "transparent";
    }
  });
}

function deactivateCommentViewer() {
  const commentsSection = document.querySelector("#comments");
  const secondaryContainer = getActiveSecondary();
  const relatedVideos = document.querySelector("#secondary-inner");
  const belowContainer = getBelowContainer();

  if (!commentsSection || !secondaryContainer || !relatedVideos || !belowContainer)
    return;

  // 댓글 원복
  if (secondaryContainer.contains(commentsSection)) {
    belowContainer.appendChild(commentsSection);
  }

  // 관련 동영상 원복
  if (belowContainer.contains(relatedVideos)) {
    secondaryContainer.appendChild(relatedVideos);
  }

  // 스타일 초기화
  secondaryContainer.style.cssText = "";
  commentsSection.style.cssText = "";
  commentsSection.classList.remove("ytd-comments");

  const commentItems = commentsSection.querySelectorAll("ytd-comment-thread-renderer");
  commentItems.forEach((item) => {
    item.style.cssText = "";
    item.classList.remove("style-scope", "ytd-item-section-renderer");

    const commentBody = item.querySelector("#body");
    if (commentBody) {
      commentBody.style.backgroundColor = "";
    }
  });
}
