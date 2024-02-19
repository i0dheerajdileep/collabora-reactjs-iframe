import React, { ChangeEvent } from 'react';
import './App.css';
import ServerAddressForm from './ServerAddressForm';
import LoaderForm from './LoaderForm';

interface EditorMessage {
    MessageId: string;
    SendTime? : number;
    ScriptFile?: string;
    Function?: string;
    Values?: {
        [key: string]: any;
    };
    TargetWindow?: Window;
}

    

class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.handleInputChanged = this.handleInputChanged.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePostMessageSubmit = this.handlePostMessageSubmit.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.state = {
            serverAddress: '',
            startLoading: false,
            wopiUrl: '',
            token: '',
            postMessage: '', // Added state for postMessage
        };
    }

    componentDidMount() {
        // Add an event listener to listen for postMessage events
        window.addEventListener('message', this.handlePostMessageEvent);
      }
    
      componentWillUnmount() {
        // Remove the event listener when the component is about to be unmounted
        window.removeEventListener('message', this.handlePostMessageEvent);
      }
    
      handlePostMessageEvent = (event: MessageEvent) => {
        // Check the origin of the message to enhance security
        if (event.origin !== 'https://localhost:9980') {
          return;
        }
    
        // Access the data sent in the message
        const receivedData: EditorMessage = event.data;
    
        // Process the received data as needed
        console.log('Received message from iframe:', receivedData);
      };
    
    handleInputChanged(address: string) {
        this.setState({ serverAddress: address });
    }

    handlePostMessageSubmit(event: React.FormEvent) {
        event.preventDefault();
        let text = "success";
    
        const message: EditorMessage = {
            "MessageId": 'CallPythonScript',
            "SendTime": Date.now(),
            "ScriptFile": 'InsertText.py',
            "Function": 'InsertText',
            'Values': { 'text': {'type': 'string', 'value': this.state.postMessage}}
            // "Values": null
        };
        console.log(message,"message")
    
        const rcvmessage: EditorMessage = {
            MessageId: 'CallPythonScript-Result',
        };
    
        console.log("hiiiiiii");
        const editorIframe = document.getElementById('collabora-online-viewer');
        console.log("iframe", editorIframe);
    
        if (editorIframe instanceof HTMLIFrameElement) {
            // Check if the iframe is already loaded
            if (editorIframe.contentWindow) {
                editorIframe.contentWindow.postMessage(JSON.stringify({'MessageId': 'Host_PostmessageReady'}), 'https://localhost:9980');
                console.log("iframe already loaded");
                // postMessage(JSON.stringify({'MessageId': 'Host_PostmessageReady'}), '*');
                editorIframe.contentWindow.postMessage(JSON.stringify(message), 'https://localhost:9980');
                console.log("submitted message");
                editorIframe.contentWindow.postMessage(rcvmessage, 'https://localhost:9980');
            } else {
                // If not loaded, set onload event listener
                editorIframe.onload = function () {
                    editorIframe.contentWindow?.postMessage(JSON.stringify(message), 'https://localhost:9980');
                    console.log("iframe ready");
                    editorIframe.contentWindow?.postMessage(JSON.stringify({'MessageId': 'Host_PostmessageReady'}), 'https://localhost:9980');
                    console.log("submitted message");
                    editorIframe.contentWindow?.postMessage(rcvmessage, 'https://localhost:9980');
                };
            }
        }
    }
    
   
    handleMessageChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({ postMessage: event.target.value });
    }

    handleSubmit() {
        const locationOrigin = window.location.origin;
        const scheme = locationOrigin.startsWith('https') ? 'https' : 'http';

        const wopiClientHost = this.state.serverAddress;
        if (!wopiClientHost) {
            alert('No server address entered');
            return;
        }
        if (!wopiClientHost.startsWith('http')) {
            alert('Warning! You have to specify the scheme protocol too (http|https) for the server address.');
            return;
        }
        if (!wopiClientHost.startsWith(scheme + '://')) {
            alert('Collabora Online server address scheme does not match the current page url scheme');
            return;
        }

        const wopiSrc = `${locationOrigin}/wopi/files/1`;

        fetch(`/collaboraUrl?server=${wopiClientHost}`)
            .then(response => response.json())
            .then(data => {
                const wopiClientUrl = data.url;
                const accessToken = data.token;
                const wopiUrl = `${wopiClientUrl}WOPISrc=${wopiSrc}`;
                console.log(`wopiUrl: ${wopiUrl}`);
                this.setState({
                    startLoading: true,
                    wopiUrl: wopiUrl,
                    token: accessToken,
                });
            });
    }

    componentDidUpdate() {
        if (this.state.startLoading) {
            this.setState({ startLoading: false });
        }
    }

    render() {
        let loaderForm;
        if (this.state.startLoading) {
            loaderForm = (
                <LoaderForm
                    url={this.state.wopiUrl}
                    token={this.state.token}
                />
            );
        }

        return (
            <div className="App">
                <form onSubmit={this.handlePostMessageSubmit}>
                    <label>Enter post message</label>
                    <input
                        type='text'
                        value={this.state.postMessage}
                        onChange={this.handleMessageChange}
                    />
                    <button type='submit'>Submit</button>
                </form>
                <ServerAddressForm
                    address={this.state.serverAddress}
                    onChange={this.handleInputChanged}
                    onSubmit={this.handleSubmit}
                />
                {loaderForm}
                <iframe title="Collabora Online Viewer" id="collabora-online-viewer" name="collabora-online-viewer"></iframe>
            </div>
        );
    }
}

export default App;
