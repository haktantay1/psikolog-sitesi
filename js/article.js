// Yazılardaki YouTube videoları yalnızca tıklanınca yüklenir (youtube-nocookie).
document.querySelectorAll('.yt[data-yt]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var frame = document.createElement('div');
    frame.className = 'yt-frame';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
    iframe.title = btn.getAttribute('aria-label') || 'Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
    btn.replaceWith(frame);
  });
});
