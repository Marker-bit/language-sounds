"use client";

import YandexLogin2 from "@/components/oauth/YandexLogin2";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const clientId = "9edc9366c5b44134b55ef19abb8e9342";
const Page = () => {
  const [host, setHost] = useState<string>("");
  const [authData, setAuthData] = useState<{
    access_token?: string | null;
    expires_in?: string | null;
  }>({});
  const [accountData, setAccountData] = useState<{
    login?: string;
    default_email?: string;
    real_name?: string;
    default_avatar_id?: string;
  }>({});
  useEffect(() => {
    setHost(window.location.host);
    const expires = window.localStorage.getItem("yandexTokenExpires");
    if (expires) {
      if (new Date() > new Date(expires)) {
        window.localStorage.removeItem("yandexToken");
        window.localStorage.removeItem("yandexTokenExpires");
      }
    }
    setAuthData({
      access_token: window.localStorage.getItem("yandexToken"),
      expires_in: window.localStorage.getItem("yandexTokenExpires"),
    });
    if (window.localStorage.getItem("yandexToken")) {
      updateAccountData(window.localStorage.getItem("yandexToken")!);
    }
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    console.log(hash);
    const data: any = {};
    const d = hash.split("&");
    for (const i of d) {
      const dd = i.split("=");
      data[dd[0]!] = dd[1];
    }
    console.log(data);
    const expireDate = new Date();
    expireDate.setSeconds(
      expireDate.getSeconds() + parseInt(data["expires_in"])
    );
    const expireString = expireDate.toISOString();
    window.localStorage.setItem("yandexToken", data["access_token"]);
    window.localStorage.setItem("yandexTokenExpires", expireString);
    setAuthData({
      access_token: data["access_token"],
      expires_in: expireString,
    });
    updateAccountData(data["access_token"]);
  }, []);

  function updateAccountData(access_token: string) {
    fetch("https://login.yandex.ru/info", {
      headers: {
        Authorization: `OAuth ${access_token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setAccountData(data);
      });
  }

  function logOut() {
    window.localStorage.removeItem("yandexToken");
    window.localStorage.removeItem("yandexTokenExpires");
    window.location.hash = "";
    window.location.reload();
  }
  return (
    <>
      {authData.access_token ? (
        <div className="bg-gradient-to-br from-red-500/20 to-orange-400/30 rounded-md p-2 w-fit mx-auto hover:rotate-3 transition-transform cursor-default flex gap-2">
          <Image
            src={`https://avatars.yandex.net/get-yapic/${accountData.default_avatar_id}/islands-200`}
            alt="avatar"
            width={200}
            height={200}
            className="w-20 h-20 rounded-xl"
          />
          <div>
            <h1 className="text-2xl font-bold">Данные об аккаунте Яндекс</h1>
            <p>
              <span className="text-black/50">Имя пользователя</span>:{" "}
              {accountData.login}
            </p>
            <p>
              <span className="text-black/50">Почта</span>:{" "}
              {accountData.default_email}
            </p>
            <p>
              <span className="text-black/50">Имя</span>:{" "}
              {accountData.real_name}
            </p>

            <Button onClick={logOut}>Выйти из аккаунта</Button>
          </div>
        </div>
      ) : (
        <YandexLogin2 clientID={clientId} redirectUrl={host === "localhost:3000" ? `http://${host}/yadisk` : `https://${host}/yadisk`}>
          <Button>Войти</Button>
        </YandexLogin2>
      )}
    </>
  );
};

export default Page;
