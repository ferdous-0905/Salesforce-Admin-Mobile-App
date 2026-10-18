import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { LearningResource } from "../domain/models";
import { videoEmbedUrl } from "../domain/resources";
import { Button } from "../ui/primitives";
import { styles as s, colors } from "../ui/theme";
const appOrigin = "https://com.mdferdousakhter.salesforceadminquiz2026";
/** Local HTML supplies the app Referer on Android and iOS. No external navigation is launched. */
function playerHtml(resource: LearningResource) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body,#player{width:100%;height:100%;margin:0;background:#122820;overflow:hidden}iframe{border:0}</style></head><body><div id="player"></div><script>function send(value){window.ReactNativeWebView.postMessage(JSON.stringify(value))}window.onYouTubeIframeAPIReady=function(){new YT.Player('player',{videoId:${JSON.stringify(resource.youtubeId)},width:'100%',height:'100%',playerVars:{playsinline:1,autoplay:0,rel:0,start:${resource.startSeconds ?? 0},origin:${JSON.stringify(appOrigin)},widget_referrer:${JSON.stringify(appOrigin)}},events:{onReady:function(){send({type:'ready'})},onError:function(e){send({type:'error',code:e.data})},onStateChange:function(e){send({type:'state',state:e.data})}}})};var script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';document.body.appendChild(script);</script></body></html>`;
}
export function LearningVideo({
  resource,
  active,
}: {
  resource: LearningResource;
  active: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!active) setOpened(false);
  }, [active]);
  useEffect(() => {
    if (!opened || ready || error) return;
    timer.current = setTimeout(
      () =>
        setError(
          "The video is taking too long to load. Check your internet connection and try again.",
        ),
      25000,
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [opened, ready, error, version]);
  function retry() {
    setError("");
    setReady(false);
    setVersion((v) => v + 1);
    setOpened(true);
  }
  if (!videoEmbedUrl(resource))
    return <Text style={s.small}>This video reference is unavailable.</Text>;
  return (
    <View style={s.rationale}>
      <Text style={s.heading}>{resource.title}</Text>
      <Text style={s.description}>{resource.relevance}</Text>
      <Text style={s.small}>
        {resource.publisher} · Reviewed {resource.reviewedAt}
      </Text>
      {opened && active ? (
        <>
          <View style={v.player}>
            <WebView
              key={version}
              style={{ flex: 1, backgroundColor: "#122820" }}
              source={{ html: playerHtml(resource), baseUrl: appOrigin + "/" }}
              originWhitelist={["https://*"]}
              javaScriptEnabled
              allowsInlineMediaPlayback
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
              setSupportMultipleWindows={false}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === "ready") {
                    setReady(true);
                    setError("");
                  }
                  if (data.type === "error") {
                    setError(
                      `YouTube could not play this reference (code ${data.code}). Retry here when your connection is available.`,
                    );
                  }
                } catch {
                  /* Ignore unrelated player messages. */
                }
              }}
              onError={() =>
                setError(
                  "The video could not load. Check your internet connection and retry here.",
                )
              }
              onShouldStartLoadWithRequest={(request) => {
                if (
                  request.url === "about:blank" ||
                  request.url.startsWith(appOrigin)
                )
                  return true;
                try {
                  const url = new URL(request.url);
                  return (
                    url.protocol === "https:" &&
                    [
                      "www.youtube.com",
                      "www.youtube-nocookie.com",
                      "m.youtube.com",
                      "accounts.google.com",
                      "consent.youtube.com",
                    ].includes(url.hostname)
                  );
                } catch {
                  return false;
                }
              }}
            />
            {!ready && !error && (
              <ActivityIndicator
                accessibilityLabel="Loading video"
                style={v.loading}
                color={colors.teal}
              />
            )}
          </View>
          {!!error && (
            <Text accessibilityLiveRegion="polite" style={s.error}>
              {error}
            </Text>
          )}
          <View style={s.row}>
            {!!error && (
              <Button
                title="Retry video"
                icon="review"
                tone="clay"
                secondary
                onPress={retry}
              />
            )}
            <Button
              title="Close player"
              icon="close"
              tone="clay"
              secondary
              onPress={() => setOpened(false)}
            />
          </View>
        </>
      ) : (
        <Button
          title="Play video inside app"
          icon="play"
          tone="clay"
          onPress={retry}
        />
      )}
      <Text style={s.small}>
        Internet is needed for YouTube. The player stays inside this app.
      </Text>
      <Text style={s.small}>{resource.reviewNote}</Text>
    </View>
  );
}
const v = StyleSheet.create({
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    minHeight: 220,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#122820",
  },
  loading: { position: "absolute", alignSelf: "center", top: "45%" },
});
