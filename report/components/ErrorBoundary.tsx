import React, { ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    error: any | undefined;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    state: State = {
        error: undefined,
    };

    static getDerivedStateFromError(error: any) {
        return { error };
    }

    render() {
        if (this.state.error !== undefined) {
            const displayError = () => {
                let desc: string;

                if (this.state.error instanceof Error) {
                    desc = this.state.error.message + "\n\n" + this.state.error.stack;
                } else {
                    desc = (this.state.error + "").slice(0, 1000);
                }

                alert(desc);
            };

            return (
                <div className="ErrorBoundary">
                    <h1>
                        This component crashed, please{" "}
                        <a target="_blank" href="https://github.com/mlomb/chat-analytics/issues">
                            report the issue here
                        </a>
                    </h1>
                    <button onClick={displayError}>View error</button>
                </div>
            );
        }

        return this.props.children;
    }
}
