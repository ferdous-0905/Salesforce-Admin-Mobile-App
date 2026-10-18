import React, { useState } from "react";
import { Modal, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Button } from "../ui/primitives";
import { styles as s } from "../ui/theme";
export function ReferenceViewer({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) {
  const [error, setError] = useState(false);
  return (
    <Modal visible={!!url} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={[s.heading, { flex: 1 }]}>Official reference</Text>
          <Button title="Close" icon="close" secondary onPress={onClose} />
        </View>
        {!!url && (
          <>
            <Text style={[s.small, { padding: 14 }]}>{url}</Text>
            {error && (
              <Text style={[s.error, { padding: 14 }]}>
                This online reference could not load. Check your connection.
              </Text>
            )}
            <WebView
              key={url}
              source={{ uri: url }}
              onLoadStart={() => setError(false)}
              onError={() => setError(true)}
              style={{ flex: 1 }}
              originWhitelist={["https://*"]}
              setSupportMultipleWindows={false}
              onShouldStartLoadWithRequest={(r) =>
                r.url === "about:blank" || r.url.startsWith("https://")
              }
            />
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
