(function () {
  if (!document.querySelector('.hero')) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'graph-canvas';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var dpr = window.devicePixelRatio || 1;
  var W, H;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var mobile = function () { return W < 768; };

  // --- SVG icon paths (24x24 viewBox) ---
  var P = {
    imessage: 'M5.285 0A5.273 5.273 0 0 0 0 5.285v13.43A5.273 5.273 0 0 0 5.285 24h13.43A5.273 5.273 0 0 0 24 18.715V5.285A5.273 5.273 0 0 0 18.715 0ZM12 4.154a8.809 7.337 0 0 1 8.809 7.338A8.809 7.337 0 0 1 12 18.828a8.809 7.337 0 0 1-2.492-.303A8.656 7.337 0 0 1 5.93 19.93a9.929 7.337 0 0 0 1.54-2.155 8.809 7.337 0 0 1-4.279-6.283A8.809 7.337 0 0 1 12 4.154',
    whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
    signal: 'M12 0q-.934 0-1.83.139l.17 1.111a11 11 0 0 1 3.32 0l.172-1.111A12 12 0 0 0 12 0M9.152.34A12 12 0 0 0 5.77 1.742l.584.961a10.8 10.8 0 0 1 3.066-1.27zm5.696 0-.268 1.094a10.8 10.8 0 0 1 3.066 1.27l.584-.962A12 12 0 0 0 14.848.34M12 2.25a9.75 9.75 0 0 0-8.539 14.459c.074.134.1.292.064.441l-1.013 4.338 4.338-1.013a.62.62 0 0 1 .441.064A9.7 9.7 0 0 0 12 21.75c5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25',
    discord: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
    telegram: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
    messenger: 'M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13',
    gmail: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
    instagram: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
    googlecalendar: 'M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z',
    googledrive: 'M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.005-.02-1.708-3.001-3.775-6.62l-3.76-6.574zm-4.76 1.73a789.828 789.861 0 0 0-3.63 6.319L0 15.868l1.89 3.298 1.885 3.297 3.62-6.335 3.618-6.33-1.88-3.287C8.1 4.704 7.255 3.22 7.25 3.214zm2.259 12.653-.203.348c-.114.198-.96 1.672-1.88 3.287a423.93 423.948 0 0 1-1.698 2.97c-.01.026 3.24.042 7.222.042h7.244l1.796-3.157c.992-1.734 1.85-3.23 1.906-3.323l.104-.167h-7.249z',
    dropbox: 'M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z',
    notion: 'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z',
    obsidian: 'M19.355 18.538a68.967 68.959 0 0 0 1.858-2.954.81.81 0 0 0-.062-.9c-.516-.685-1.504-2.075-2.042-3.362-.553-1.321-.636-3.375-.64-4.377a1.707 1.707 0 0 0-.358-1.05l-3.198-4.064a3.744 3.744 0 0 1-.076.543c-.106.503-.307 1.004-.536 1.5-.134.29-.29.6-.446.914l-.31.626c-.516 1.068-.997 2.227-1.132 3.59-.124 1.26.046 2.73.815 4.481.128.011.257.025.386.044a6.363 6.363 0 0 1 3.326 1.505c.916.79 1.744 1.922 2.415 3.5zM8.199 22.569c.073.012.146.02.22.02.78.024 2.095.092 3.16.29.87.16 2.593.64 4.01 1.055 1.083.316 2.198-.548 2.355-1.664.114-.814.33-1.735.725-2.58l-.01.005c-.67-1.87-1.522-3.078-2.416-3.849a5.295 5.295 0 0 0-2.778-1.257c-1.54-.216-2.952.19-3.84.45.532 2.218.368 4.829-1.425 7.531zM5.533 9.938c-.023.1-.056.197-.098.29L2.82 16.059a1.602 1.602 0 0 0 .313 1.772l4.116 4.24c2.103-3.101 1.796-6.02.836-8.3-.728-1.73-1.832-3.081-2.55-3.831zM9.32 14.01c.615-.183 1.606-.465 2.745-.534-.683-1.725-.848-3.233-.716-4.577.154-1.552.7-2.847 1.235-3.95.113-.235.223-.454.328-.664.149-.297.288-.577.419-.86.217-.47.379-.885.46-1.27.08-.38.08-.72-.014-1.043-.095-.325-.297-.675-.68-1.06a1.6 1.6 0 0 0-1.475.36l-4.95 4.452a1.602 1.602 0 0 0-.513.952l-.427 2.83c.672.59 2.328 2.316 3.335 4.711.09.21.175.43.253.653z',
    // Clean bold hashtag for Slack (evenodd fill-rule)
    slack: 'M6 1.5A1.5 1.5 0 0 1 7.5 3v4h9V3a1.5 1.5 0 0 1 3 0v4H22.5a1.5 1.5 0 0 1 0 3H19.5v4h3a1.5 1.5 0 0 1 0 3H19.5v4a1.5 1.5 0 0 1-3 0v-4h-9v4a1.5 1.5 0 0 1-3 0v-4H1.5a1.5 1.5 0 0 1 0-3h3v-4h-3a1.5 1.5 0 0 1 0-3h3V3A1.5 1.5 0 0 1 6 1.5zm1.5 8.5v4h9v-4h-9z',
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    phone: 'M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
    facetime: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
    applenotes: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z',
    localfiles: 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
    // L1 entity icons
    messages: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
    conversations: 'M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z',
    events: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z',
    docs: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z'
  };

  // Icons needing evenodd fill-rule
  var evenodd = { slack: true };

  // Preload icons as Image objects from SVG data URLs
  var icons = {};
  var loadCount = 0;
  var totalIcons = Object.keys(P).length;

  function svgUrl(path, fill, eo) {
    var fr = eo ? ' fill-rule="evenodd"' : '';
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path' + fr + ' fill="' + fill + '" d="' + path + '"/></svg>'
    );
  }

  function preload(key, fill) {
    var img = new Image();
    img.onload = function () { loadCount++; if (loadCount >= totalIcons && !started) start(); };
    img.onerror = function () { loadCount++; if (loadCount >= totalIcons && !started) start(); };
    img.src = svgUrl(P[key], fill, evenodd[key]);
    icons[key] = img;
  }

  var L1 = [
    { label: 'Messages',      color: '#7C5CFF', icon: 'messages' },
    { label: 'Conversations', color: '#00D4AA', icon: 'conversations' },
    { label: 'Events',        color: '#60A5FA', icon: 'events' },
    { label: 'Docs',          color: '#E879F9', icon: 'docs' }
  ];

  var L2 = [
    { label: 'iMessage',        color: '#34C759', icon: 'imessage',        parents: [0, 1] },
    { label: 'WhatsApp',        color: '#25D366', icon: 'whatsapp',        parents: [0, 1] },
    { label: 'Signal',          color: '#3A76F0', icon: 'signal',          parents: [0, 1] },
    { label: 'Slack',           color: '#E01E5A', icon: 'slack',           parents: [0, 1] },
    { label: 'Discord',         color: '#5865F2', icon: 'discord',         parents: [0, 1] },
    { label: 'Telegram',        color: '#26A5E4', icon: 'telegram',        parents: [0, 1] },
    { label: 'Messenger',       color: '#0084FF', icon: 'messenger',       parents: [0, 1] },
    { label: 'Gmail',           color: '#EA4335', icon: 'gmail',           parents: [0, 1, 2] },
    { label: 'Phone',           color: '#30D158', icon: 'phone',           parents: [0] },
    { label: 'FaceTime',        color: '#30D158', icon: 'facetime',        parents: [0] },
    { label: 'LinkedIn',        color: '#0A66C2', icon: 'linkedin',        parents: [0] },
    { label: 'Instagram',       color: '#E4405F', icon: 'instagram',       parents: [0] },
    { label: 'Google Calendar',  color: '#4285F4', icon: 'googlecalendar', parents: [2] },
    { label: 'Google Drive',     color: '#4285F4', icon: 'googledrive',    parents: [3] },
    { label: 'Dropbox',         color: '#0061FF', icon: 'dropbox',         parents: [3] },
    { label: 'Apple Notes',     color: '#FFD60A', icon: 'applenotes',      parents: [3] },
    { label: 'Notion',          color: '#EDEDF0', icon: 'notion',          parents: [3] },
    { label: 'Obsidian',        color: '#7C3AED', icon: 'obsidian',        parents: [3] },
    { label: 'Local Files',     color: '#8E8E93', icon: 'localfiles',      parents: [3] }
  ];

  for (var key in P) preload(key, '#ffffff');

  // Bounce state
  var cx, cy, vx, vy;
  var SPEED = 0.5;

  function initBounce() {
    cx = W * 0.5;
    cy = H * 0.4;
    var a = Math.PI * 0.23;
    vx = SPEED * Math.cos(a);
    vy = SPEED * Math.sin(a);
  }

  var innerAngle = 0;
  var outerAngle = 0;
  var INNER_SPEED = 0.0008;
  var OUTER_SPEED = 0.0005;
  var starPhase = 0;
  var started = false;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawIcon(img, x, y, size) {
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  }

  // Draw a 4-point star shape
  function drawStar(x, y, outerR, innerR, points) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var r = i % 2 === 0 ? outerR : innerR;
      var a = (i * Math.PI) / points - Math.PI / 2;
      if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var x0 = cx, y0 = cy;
    var dim = Math.min(W, H);
    var mob = mobile();

    // 2x sizes
    var r1 = dim * (mob ? 0.28 : 0.34);
    var r2 = dim * (mob ? 0.56 : 0.68);
    var iconL1 = mob ? 28 : 36;
    var iconL2 = mob ? 20 : 28;

    // Compute L1 positions
    var l1p = L1.map(function (n, i) {
      var a = innerAngle + (i / L1.length) * Math.PI * 2 - Math.PI / 2;
      return { x: x0 + Math.cos(a) * r1, y: y0 + Math.sin(a) * r1, color: n.color, label: n.label, icon: n.icon };
    });

    // Compute L2 positions
    var l2p = L2.map(function (n, j) {
      var a = outerAngle + (j / L2.length) * Math.PI * 2 - Math.PI / 2;
      return { x: x0 + Math.cos(a) * r2, y: y0 + Math.sin(a) * r2, color: n.color, label: n.label, icon: n.icon, parents: n.parents };
    });

    // Edges: center → L1
    l1p.forEach(function (n) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = 'rgba(124, 92, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Edges: L1 → L2
    l2p.forEach(function (n) {
      n.parents.forEach(function (pi) {
        var p = l1p[pi];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = 'rgba(124, 92, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    // L2 nodes (outer ring)
    l2p.forEach(function (n) {
      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, iconL2 + 8);
      g.addColorStop(0, n.color + '25');
      g.addColorStop(1, n.color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, iconL2 + 8, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      drawIcon(icons[n.icon], n.x, n.y, iconL2);
    });

    // L1 nodes (inner ring)
    l1p.forEach(function (n) {
      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, iconL1 + 16);
      g.addColorStop(0, n.color + '40');
      g.addColorStop(1, n.color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, iconL1 + 16, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      drawIcon(icons[n.icon], n.x, n.y, iconL1);
      ctx.font = (mob ? '14' : '16') + 'px "Geist Mono", monospace';
      ctx.fillStyle = n.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, n.x, n.y + iconL1 / 2 + 10);
    });

    // --- Center node: shining star ---
    var pulse = 0.5 + 0.5 * Math.sin(starPhase);

    // Outer soft glow (pulsing)
    var g1 = ctx.createRadialGradient(x0, y0, 0, x0, y0, 80 + pulse * 20);
    g1.addColorStop(0, 'rgba(124, 92, 255, ' + (0.12 + pulse * 0.08) + ')');
    g1.addColorStop(0.5, 'rgba(124, 92, 255, ' + (0.04 + pulse * 0.03) + ')');
    g1.addColorStop(1, 'rgba(124, 92, 255, 0)');
    ctx.beginPath();
    ctx.arc(x0, y0, 100, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();

    // Star rays (cross-shaped light beams)
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(starPhase * 0.1);
    var rayLen = 40 + pulse * 15;
    for (var ri = 0; ri < 4; ri++) {
      var ra = ri * Math.PI / 2;
      var g2 = ctx.createLinearGradient(0, 0, Math.cos(ra) * rayLen, Math.sin(ra) * rayLen);
      g2.addColorStop(0, 'rgba(200, 180, 255, ' + (0.5 + pulse * 0.3) + ')');
      g2.addColorStop(1, 'rgba(124, 92, 255, 0)');
      ctx.beginPath();
      ctx.moveTo(Math.cos(ra - 0.15) * 6, Math.sin(ra - 0.15) * 6);
      ctx.lineTo(Math.cos(ra) * rayLen, Math.sin(ra) * rayLen);
      ctx.lineTo(Math.cos(ra + 0.15) * 6, Math.sin(ra + 0.15) * 6);
      ctx.closePath();
      ctx.fillStyle = g2;
      ctx.fill();
    }
    // Diagonal rays (thinner)
    for (var di = 0; di < 4; di++) {
      var da = di * Math.PI / 2 + Math.PI / 4;
      var dLen = 25 + pulse * 10;
      var g3 = ctx.createLinearGradient(0, 0, Math.cos(da) * dLen, Math.sin(da) * dLen);
      g3.addColorStop(0, 'rgba(200, 180, 255, ' + (0.3 + pulse * 0.2) + ')');
      g3.addColorStop(1, 'rgba(124, 92, 255, 0)');
      ctx.beginPath();
      ctx.moveTo(Math.cos(da - 0.1) * 5, Math.sin(da - 0.1) * 5);
      ctx.lineTo(Math.cos(da) * dLen, Math.sin(da) * dLen);
      ctx.lineTo(Math.cos(da + 0.1) * 5, Math.sin(da + 0.1) * 5);
      ctx.closePath();
      ctx.fillStyle = g3;
      ctx.fill();
    }
    ctx.restore();

    // Inner bright core
    var g4 = ctx.createRadialGradient(x0, y0, 0, x0, y0, 18);
    g4.addColorStop(0, 'rgba(220, 210, 255, ' + (0.9 + pulse * 0.1) + ')');
    g4.addColorStop(0.4, 'rgba(155, 127, 255, 0.6)');
    g4.addColorStop(1, 'rgba(124, 92, 255, 0)');
    ctx.beginPath();
    ctx.arc(x0, y0, 18, 0, Math.PI * 2);
    ctx.fillStyle = g4;
    ctx.fill();

    // Bright center dot
    ctx.beginPath();
    ctx.arc(x0, y0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#DDD6FF';
    ctx.fill();

    // Label
    ctx.font = 'bold 20px "Geist Mono", monospace';
    ctx.fillStyle = '#EDEDF0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('LifeDB', x0, y0 + 26);
  }

  function tick() {
    innerAngle += INNER_SPEED;
    outerAngle += OUTER_SPEED;
    starPhase += 0.02;

    // Move center
    cx += vx;
    cy += vy;

    // Bounce when L1 nodes hit viewport edge
    var dim = Math.min(W, H);
    var mob = mobile();
    var r1 = dim * (mob ? 0.28 : 0.34);
    var iconL1 = mob ? 28 : 36;
    var pad = r1 + iconL1 / 2;

    if (cx < pad)     { cx = pad;     vx = Math.abs(vx); }
    if (cx > W - pad) { cx = W - pad; vx = -Math.abs(vx); }
    if (cy < pad)     { cy = pad;     vy = Math.abs(vy); }
    if (cy > H - pad) { cy = H - pad; vy = -Math.abs(vy); }

    draw();
    requestAnimationFrame(tick);
  }

  function start() {
    started = true;
    initBounce();
    if (reducedMotion) { draw(); return; }
    requestAnimationFrame(tick);
  }

  // Fallback: start after 500ms even if some icons fail
  setTimeout(function () { if (!started) start(); }, 500);
})();
