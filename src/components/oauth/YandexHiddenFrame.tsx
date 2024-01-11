import React from 'react';

export default function YandexHiddenFrame(props: {
  redirectTo: string
}) {
  return (
    <iframe hidden title="yandex-hidden-frame" src={props.redirectTo}></iframe>
  );
}