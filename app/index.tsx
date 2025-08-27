import React, { useEffect, useRef } from "react";
import { View, Text, useColorScheme, Animated, ScrollView } from "react-native";

export default function Index() {
  // Add logging to help debug
  useEffect(() => {
    console.log("📍 Index screen mounted");
    return () => {
      console.log("📍 Index screen unmounted");
    };
  }, []);

  const isDark = useColorScheme() === "dark";
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const cardBg = isDark ? "#0F172A" : "#FFFFFF";
  const border = isDark ? "#1F2937" : "#E5E7EB";
  const shimmer = isDark ? "#1F2937" : "#E5E7EB";

  // Skeleton replica of Home while routing completes
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FAFBFC" }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                color: isDark ? "#fff" : "#0F172A",
                fontSize: 28,
                fontWeight: "700",
              }}
            >
              FitNext
            </Text>
            <Text
              style={{ color: isDark ? "#9CA3AF" : "#64748B", marginTop: 4 }}
            >
              Your fitness journey
            </Text>
          </View>
          <Animated.View
            style={{
              opacity: pulse,
              height: 48,
              width: 48,
              borderRadius: 24,
              backgroundColor: shimmer,
              borderWidth: 1,
              borderColor: border,
            }}
          />
        </View>
      </View>

      {/* Today's Progress skeleton card */}
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            borderRadius: 24,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: border,
            padding: 16,
            marginTop: 16,
            shadowColor: "#000",
            shadowOpacity: isDark ? 0.2 : 0.06,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Animated.View
            style={{
              opacity: pulse,
              height: 22,
              width: 200,
              borderRadius: 11,
              backgroundColor: shimmer,
              marginBottom: 10,
            }}
          />
          <Animated.View
            style={{
              opacity: pulse,
              height: 14,
              width: 140,
              borderRadius: 7,
              backgroundColor: shimmer,
              marginBottom: 16,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Animated.View
              style={{
                opacity: pulse,
                height: 96,
                width: 96,
                borderRadius: 48,
                backgroundColor: shimmer,
                marginRight: 16,
              }}
            />
            <View style={{ flex: 1, gap: 10 }}>
              <Animated.View
                style={{
                  opacity: pulse,
                  height: 10,
                  borderRadius: 6,
                  backgroundColor: shimmer,
                  width: "92%",
                }}
              />
              <Animated.View
                style={{
                  opacity: pulse,
                  height: 10,
                  borderRadius: 6,
                  backgroundColor: shimmer,
                  width: "82%",
                }}
              />
              <Animated.View
                style={{
                  opacity: pulse,
                  height: 10,
                  borderRadius: 6,
                  backgroundColor: shimmer,
                  width: "88%",
                }}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 6,
            }}
          >
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={{
                  opacity: pulse,
                  height: 18,
                  width: 64,
                  borderRadius: 9,
                  backgroundColor: shimmer,
                }}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Your Journey title */}
      <View style={{ marginTop: 22, paddingHorizontal: 16 }}>
        <Text
          style={{
            color: isDark ? "#fff" : "#0F172A",
            fontSize: 22,
            fontWeight: "700",
          }}
        >
          Your Journey
        </Text>
      </View>

      {/* Carousel skeleton */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={`card-${i}`}
            style={{
              width: 280,
              height: 160,
              borderRadius: 18,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: border,
              marginRight: 12,
              padding: 16,
            }}
          >
            <Animated.View
              style={{
                opacity: pulse,
                height: 18,
                width: 180,
                borderRadius: 9,
                backgroundColor: shimmer,
                marginBottom: 10,
              }}
            />
            <Animated.View
              style={{
                opacity: pulse,
                height: 10,
                width: 140,
                borderRadius: 6,
                backgroundColor: shimmer,
                marginBottom: 10,
              }}
            />
            <Animated.View
              style={{
                opacity: pulse,
                height: 10,
                width: 200,
                borderRadius: 6,
                backgroundColor: shimmer,
              }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Additional scrollable skeleton blocks */}
      <View style={{ paddingHorizontal: 16 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={`row-${i}`}
            style={{
              borderRadius: 16,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Animated.View
              style={{
                opacity: pulse,
                height: 14,
                width: 220,
                borderRadius: 7,
                backgroundColor: shimmer,
                marginBottom: 8,
              }}
            />
            <Animated.View
              style={{
                opacity: pulse,
                height: 10,
                width: 180,
                borderRadius: 6,
                backgroundColor: shimmer,
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
