import React, { useEffect } from 'react';
import YandexHiddenFrame from './YandexHiddenFrame';
// import logo from './yandex_login.png';

function checkAccessKey() {
  const parts = window.location.href.split('#')
  const queryPartUrl = parts.length > 1 && parts[1] !== 'frame' ? parts[1] : null;
  if (!queryPartUrl) {
    return null;
  }
  let result: object = {};
  queryPartUrl.split("&").forEach(function (part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function getYandexAuthUrl(clientID: string, redirectUrl: string) {
  let requestUrl = 'https://oauth.yandex.ru/authorize?response_type=token&client_id=' + clientID;
  requestUrl += '&redirect_uri=' + encodeURIComponent(redirectUrl);
  requestUrl += '&display=popup';
  return requestUrl;
}

function getCurrentUrl() {
  let currentUrl = window.location.origin;
  if (currentUrl[currentUrl.length - 1] === '/') {
    currentUrl = currentUrl.slice(0, currentUrl.length - 1)
  }
  return currentUrl;
}

export default function YandexLogin(props: {
  onSuccess: Function,
  clientID: string,
  children: React.ReactElement
}) {
  const handleMessageFromPopup = (event: any) => {
    if (event.data.source === 'yandex-login') {
      props.onSuccess(event.data.payload);
    }
  }

  const onClick = () => {
    sessionStorage.setItem('yandexAutoLoginDisabled', 'false');
    let currentUrl = getCurrentUrl();
    const requestUrl = getYandexAuthUrl(props.clientID, currentUrl);

    const h = 650;
    const w = 550;
    const y = window.top!.outerHeight / 2 + window.top!.screenY - (h / 2);
    const x = window.top!.outerWidth / 2 + window.top!.screenX - (w / 2);
    window.open(requestUrl, 'popup', `width=${w},height=${h},top=${y},left=${x}`);

    window.addEventListener('message', handleMessageFromPopup, { once: true });
  }

  let frameRedirectTo = null;

  const aki = checkAccessKey();
  const receiver = window.parent !== window
    ? window.parent
    : window.opener;

  useEffect(() => {
    if (aki && receiver) {
      receiver.postMessage({
        source: 'yandex-login',
        payload: aki
      }, window.location.origin);
      
      window.close();
    }
  });

  

  if (!aki && !receiver) {
    const autoLoginDIsabled = sessionStorage.getItem('yandexAutoLoginDisabled');

    frameRedirectTo = autoLoginDIsabled !== 'true' 
      ? getYandexAuthUrl(props.clientID, "https://oauth.yandex.ru/verification_code")
      : null;
    
    window.addEventListener('message', handleMessageFromPopup, { once: false });
  }

  return (
    <div>
      { React.cloneElement( props.children, { onClick: onClick } ) }
      {/* <img src={logo} alt="yandex" onClick={onClick} className="yandex-login-button" /> */}
      {frameRedirectTo && <YandexHiddenFrame redirectTo={frameRedirectTo} />}
    </div>
  );
}