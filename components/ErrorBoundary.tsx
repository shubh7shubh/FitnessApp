import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("🚨 ErrorBoundary caught an error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 ErrorBoundary details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-black justify-center items-center px-6">
          <Text className="text-red-400 text-xl font-bold mb-4 text-center">
            Something went wrong
          </Text>
          <Text className="text-white text-center mb-6 leading-6">
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>

          {__DEV__ && (
            <View className="bg-gray-800 p-4 rounded-lg mb-6 max-h-40">
              <Text className="text-gray-300 text-xs font-mono">
                {this.state.error?.stack}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="bg-green-600 px-6 py-3 rounded-lg"
            onPress={this.handleReset}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
