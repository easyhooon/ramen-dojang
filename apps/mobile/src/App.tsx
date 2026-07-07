import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebView as WebViewType } from "react-native-webview";

import { webUrl } from "./config";

export default function App() {
  const webViewRef = useRef<WebViewType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>라멘 도장깨기</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {webUrl}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setHasError(false);
            setErrorMessage(null);
            void webViewRef.current?.reload();
          }}
          style={styles.reloadButton}
        >
          <Text style={styles.reloadText}>Reload</Text>
        </Pressable>
      </View>

      <View style={styles.webContainer}>
        {hasError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>웹 앱을 열 수 없습니다</Text>
            <Text style={styles.emptyText}>
              web 서버가 켜져 있는지, `EXPO_PUBLIC_WEB_URL`이 현재 기기에서 접근 가능한 주소인지 확인하세요.
            </Text>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>
        ) : null}

        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ uri: webUrl }}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(event) => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage(event.nativeEvent.description);
          }}
          onHttpError={(event) => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage(`HTTP ${event.nativeEvent.statusCode}`);
          }}
          style={[styles.webView, hasError ? styles.hidden : undefined]}
        />

        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#f97316" />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderBottomColor: "#263244",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
    maxWidth: 220,
  },
  reloadButton: {
    backgroundColor: "#f97316",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reloadText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webView: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    justifyContent: "center",
  },
  emptyState: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    padding: 24,
    zIndex: 1,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  errorText: {
    color: "#9a3412",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: "center",
  },
});
