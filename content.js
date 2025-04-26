let isCommentViewerActive = false;

// 유튜브 페이지가 로드될 때 실행
document.addEventListener("yt-navigate-finish", function () {
  if (window.location.pathname === "/watch") {
    setTimeout(initializeCommentViewer, 1000);
  }
});

// 메시지 수신
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleComments") {
    if (isCommentViewerActive) {
      deactivateCommentViewer();
    } else {
      activateCommentViewer();
    }
    isCommentViewerActive = !isCommentViewerActive;
  }
});

function initializeCommentViewer() {
  // 기존 댓글 섹션 찾기
  const commentsSection = document.querySelector("#comments");
  if (!commentsSection) return;

  // secondary 컨테이너 찾기
  const secondaryContainer = document.querySelector("#secondary");
  if (!secondaryContainer) return;

  // secondary 컨테이너의 내용을 비우고 스타일 적용
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

  // 댓글 섹션을 secondary 컨테이너로 이동
  secondaryContainer.appendChild(commentsSection);

  // 댓글 섹션 스타일 조정
  commentsSection.style.cssText = `
        max-height: calc(100vh - 40px);
        overflow-y: auto;
    `;

  // 메인 컨텐츠 영역 조정
  const primaryContainer = document.querySelector("#primary");
  if (primaryContainer) {
    primaryContainer.style.marginRight = "420px";
  }
}

function activateCommentViewer() {
  const commentsSection = document.querySelector("#comments");
  if (!commentsSection) return;

  const secondaryContainer = document.querySelector("#secondary");
  if (!secondaryContainer) return;

  // 관련 동영상 섹션 찾기
  const relatedVideos = document.querySelector("#secondary-inner");
  if (!relatedVideos) return;

  // 관련 동영상을 원래 댓글 위치로 이동
  const belowContainer = document.querySelector("#below");
  if (belowContainer) {
    belowContainer.appendChild(relatedVideos);
  }

  // secondary 컨테이너 스타일 조정
  secondaryContainer.style.cssText = `
    width: 400px;
    background: transparent;
    padding: 20px;
  `;

  // 댓글 섹션을 secondary 컨테이너로 이동
  secondaryContainer.appendChild(commentsSection);
  commentsSection.style.cssText = `
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  `;

  // 댓글 섹션의 스타일을 유지하기 위해 클래스 추가
  commentsSection.classList.add("ytd-comments");

  // 댓글 아이템들의 스타일 유지
  const commentItems = commentsSection.querySelectorAll(
    "ytd-comment-thread-renderer"
  );
  commentItems.forEach((item) => {
    // 기존 스타일 제거
    item.style.cssText = "";

    // 유튜브의 기본 스타일 클래스 추가
    item.classList.add("style-scope", "ytd-item-section-renderer");

    // 댓글 내용 컨테이너 스타일 조정
    const commentContent = item.querySelector("#content-text");
    if (commentContent) {
      commentContent.style.color = "inherit";
    }

    // 댓글 배경색 유지
    const commentBody = item.querySelector("#body");
    if (commentBody) {
      commentBody.style.backgroundColor = "transparent";
    }
  });
}

function deactivateCommentViewer() {
  const secondaryContainer = document.querySelector("#secondary");
  if (!secondaryContainer) return;

  // 원래 위치로 댓글 섹션 복원
  const commentsSection = document.querySelector("#comments");
  if (commentsSection) {
    const belowContainer = document.querySelector("#below");
    if (belowContainer) {
      belowContainer.appendChild(commentsSection);
    }
  }

  // 관련 동영상을 원래 위치로 복원
  const relatedVideos = document.querySelector("#secondary-inner");
  if (relatedVideos) {
    secondaryContainer.appendChild(relatedVideos);
  }

  // 스타일 초기화
  secondaryContainer.style.cssText = "";
  if (commentsSection) {
    commentsSection.style.cssText = "";
    commentsSection.classList.remove("ytd-comments");

    // 댓글 아이템들의 스타일 초기화
    const commentItems = commentsSection.querySelectorAll(
      "ytd-comment-thread-renderer"
    );
    commentItems.forEach((item) => {
      item.style.cssText = "";
      item.classList.remove("style-scope", "ytd-item-section-renderer");

      // 댓글 배경색 초기화
      const commentBody = item.querySelector("#body");
      if (commentBody) {
        commentBody.style.backgroundColor = "";
      }
    });
  }
}
