/**
 * InstaVid Downloader - FINAL FIXED SCRIPT.JS
 * NO /media ROUTE
 * ONLY USES:
 * /api/download?url=
 */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // CONFIG
    // =====================================
    const API_BASE =
        "https://fbapp.romitkryadav.workers.dev";

    // =====================================
    // ICONS
    // =====================================
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // =====================================
    // DOM
    // =====================================
    const urlInput =
        document.getElementById("url-input");

    const clearBtn =
        document.getElementById("clear-btn");

    const pasteBtn =
        document.getElementById("paste-btn");

    const downloadBtn =
        document.getElementById("download-btn");

    const loaderState =
        document.getElementById("loader-state");

    const resultState =
        document.getElementById("result-state");

    const errorState =
        document.getElementById("error-state");

    const errorMessage =
        document.getElementById("error-message");

    const resultVideo =
        document.getElementById("result-video");

    const resultThumbnail =
        document.getElementById("result-thumbnail");

    const resultUsername =
        document.getElementById("result-username");

    const resultCaption =
        document.getElementById("result-caption");

    const downloadHdBtn =
        document.getElementById("download-hd-btn");

    const copyLinkBtn =
        document.getElementById("copy-link-btn");

    const toastContainer =
        document.getElementById("toast-container");

    // =====================================
    // INIT
    // =====================================
    toggleInputState();

    // =====================================
    // EVENTS
    // =====================================
    urlInput.addEventListener(
        "input",
        toggleInputState
    );

    clearBtn.addEventListener(
        "click",
        clearInput
    );

    pasteBtn.addEventListener(
        "click",
        pasteFromClipboard
    );

    downloadBtn.addEventListener(
        "click",
        handleDownload
    );

    // =====================================
    // INPUT STATE
    // =====================================
    function toggleInputState() {

        if (urlInput.value.trim()) {

            clearBtn.classList.remove("hidden");

        } else {

            clearBtn.classList.add("hidden");
        }
    }

    // =====================================
    // CLEAR
    // =====================================
    function clearInput() {

        urlInput.value = "";

        toggleInputState();

        urlInput.focus();
    }

    // =====================================
    // PASTE
    // =====================================
    async function pasteFromClipboard() {

        try {

            const text =
                await navigator.clipboard.readText();

            if (text) {

                urlInput.value =
                    text.trim();

                toggleInputState();

                showToast(
                    "Instagram link pasted!",
                    "success"
                );
            }

        } catch {

            showToast(
                "Clipboard permission denied",
                "error"
            );
        }
    }

    // =====================================
    // VALIDATE
    // =====================================
    function validateInstagramUrl(url) {

        return /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|share\/r)\//i.test(url);
    }

    // =====================================
    // MAIN DOWNLOAD
    // =====================================
    async function handleDownload() {

        const rawUrl =
            urlInput.value.trim();

        if (!rawUrl) {

            showToast(
                "Please enter Instagram URL",
                "error"
            );

            return;
        }

        if (!validateInstagramUrl(rawUrl)) {

            showToast(
                "Invalid Instagram URL",
                "error"
            );

            return;
        }

        resetStates();

        loaderState.classList.remove("hidden");

        downloadBtn.disabled = true;

        try {

            const apiUrl =
                `${API_BASE}/api/download?url=${encodeURIComponent(rawUrl)}`;

            const response =
                await fetch(apiUrl);

            if (!response.ok) {

                throw new Error(
                    "Server returned " +
                    response.status
                );
            }

            const data =
                await response.json();

            loaderState.classList.add("hidden");

            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to extract media"
                );
            }

            displayResult(data);

            showToast(
                "Media extracted successfully!",
                "success"
            );

        } catch (err) {

            console.error(err);

            loaderState.classList.add("hidden");

            displayFailure(
                err.message ||
                "Connection failed"
            );

        } finally {

            downloadBtn.disabled = false;
        }
    }

    // =====================================
    // DISPLAY RESULT
    // =====================================
    function displayResult(data) {

        resetStates();

        resultUsername.textContent =
            data.username
                ? `@${data.username}`
                : "@instagram";

        resultCaption.textContent =
            data.caption ||
            "Instagram Media";

        // =================================
        // VIDEO
        // =================================
        if (data.video_url) {

            resultVideo.pause();

            resultVideo.removeAttribute("src");

            resultVideo.load();

            resultVideo.src =
                data.video_url;

            resultVideo.controls = true;

            resultVideo.playsInline = true;

            resultVideo.preload =
                "metadata";

            if (data.thumbnail) {

                resultVideo.poster =
                    data.thumbnail;
            }

            resultVideo.classList.remove(
                "hidden"
            );

            resultThumbnail.classList.add(
                "hidden"
            );

            resultVideo.load();

            // DOWNLOAD
            downloadHdBtn.href = "#";

            downloadHdBtn.onclick =
                async (e) => {

                    e.preventDefault();

                    try {

                        showToast(
                            "Preparing download...",
                            "success"
                        );

                        const response =
                            await fetch(
                                data.video_url
                            );

                        const blob =
                            await response.blob();

                        const blobUrl =
                            URL.createObjectURL(
                                blob
                            );

                        const a =
                            document.createElement(
                                "a"
                            );

                        a.href = blobUrl;

                        a.download =
                            "instagram-video.mp4";

                        document.body.appendChild(
                            a
                        );

                        a.click();

                        a.remove();

                        URL.revokeObjectURL(
                            blobUrl
                        );

                    } catch {

                        window.open(
                            data.video_url,
                            "_blank"
                        );
                    }
                };
        }

        // =================================
        // IMAGE
        // =================================
        else if (data.thumbnail) {

            resultThumbnail.src =
                data.thumbnail;

            resultThumbnail.classList.remove(
                "hidden"
            );

            resultVideo.pause();

            resultVideo.removeAttribute(
                "src"
            );

            resultVideo.load();

            resultVideo.classList.add(
                "hidden"
            );

            // DOWNLOAD
            downloadHdBtn.href = "#";

            downloadHdBtn.onclick =
                async (e) => {

                    e.preventDefault();

                    try {

                        showToast(
                            "Preparing download...",
                            "success"
                        );

                        const response =
                            await fetch(
                                data.thumbnail
                            );

                        const blob =
                            await response.blob();

                        const blobUrl =
                            URL.createObjectURL(
                                blob
                            );

                        const a =
                            document.createElement(
                                "a"
                            );

                        a.href = blobUrl;

                        a.download =
                            "instagram-image.jpg";

                        document.body.appendChild(
                            a
                        );

                        a.click();

                        a.remove();

                        URL.revokeObjectURL(
                            blobUrl
                        );

                    } catch {

                        window.open(
                            data.thumbnail,
                            "_blank"
                        );
                    }
                };
        }

        // =================================
        // COPY BUTTON
        // =================================
        copyLinkBtn.onclick =
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        data.video_url ||
                        data.thumbnail
                    );

                    showToast(
                        "Copied successfully!",
                        "success"
                    );

                } catch {

                    showToast(
                        "Copy failed",
                        "error"
                    );
                }
            };

        // =================================
        // SHOW RESULT
        // =================================
        resultState.classList.remove(
            "hidden"
        );

        resultState.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    // =====================================
    // FAILURE
    // =====================================
    function displayFailure(message) {

        resetStates();

        errorMessage.textContent =
            message;

        errorState.classList.remove(
            "hidden"
        );

        showToast(
            message,
            "error"
        );
    }

    // =====================================
    // RESET
    // =====================================
    function resetStates() {

        loaderState.classList.add(
            "hidden"
        );

        resultState.classList.add(
            "hidden"
        );

        errorState.classList.add(
            "hidden"
        );

        resultVideo.pause();

        resultVideo.removeAttribute(
            "src"
        );

        resultVideo.load();

        resultThumbnail.removeAttribute(
            "src"
        );
    }

    // =====================================
    // TOAST
    // =====================================
    function showToast(
        message,
        type = "success"
    ) {

        const toast =
            document.createElement("div");

        toast.className =
            "bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 mb-3 transition-opacity duration-300";

        const icon =
            type === "success"
                ? "check-circle"
                : "alert-circle";

        toast.innerHTML = `
            <i data-lucide="${icon}" class="w-5 h-5"></i>
            <span class="text-sm">${message}</span>
        `;

        toastContainer.appendChild(
            toast
        );

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        setTimeout(() => {

            toast.style.opacity = "0";

            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 3000);
    }
});