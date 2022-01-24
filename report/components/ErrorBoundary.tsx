import React, { ErrorInfo } from "react";

export default class ErrorBoundary extends React.Component {
    state = {
        hasError: false,
    };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.log("Error component stack:", errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="ErrorBoundary">
                    <h1>This component crashed, please check the console for more details</h1>
                </div>
            );
        }

        return this.props.children;
    }
}
