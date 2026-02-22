// clear mathjax cache to avoid "multiply defined" error
document.addEventListener('pjax:send', function () {
    if (window.MathJax && window.MathJax.texReset) {
        MathJax.typesetClear();
    }
});