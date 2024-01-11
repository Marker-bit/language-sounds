function getYandexAuthUrl(clientID: string, redirectUrl: string) {
  let requestUrl = 'https://oauth.yandex.ru/authorize?response_type=token&client_id=' + clientID;
  requestUrl += '&redirect_uri=' + encodeURIComponent(redirectUrl);
  requestUrl += '&display=popup';
  return requestUrl;
}

export default function YandexLogin2({
  children, 
  clientID,
  redirectUrl
}: {
  children?: React.ReactNode,
  clientID: string,
  redirectUrl: string
}) {
  const url = getYandexAuthUrl(clientID, redirectUrl);
  const onClick = () => {
    window.open(url);
  }
  return (
    <div onClick={onClick}>
      {children}
    </div>
  )
}