import * as React from "react";

interface Message {
  speaker: "user" | "bot";
  text: string;
  html?: string;
}

interface ChatbotProps {
  /** Optional API hook; if omitted, the component renders a visual skeleton */
  sendQuery?: (query: string) => Promise<string>;
  /** API Key from data pane */
  apiKey?: string;
}

interface ChatbotState {
  messages: Message[];
  inputValue: string;
  inputHtml: string;
  isSending: boolean;
}

export class ChatbotComponent extends React.Component<ChatbotProps, ChatbotState> {
  private messagesEndRef: React.RefObject<HTMLDivElement> = React.createRef();
  private editableRef: React.RefObject<HTMLDivElement> = React.createRef();
  constructor(props: ChatbotProps) {
    super(props);
    this.state = {
      messages: [
        { speaker: "bot", text: "Hello! I'm your insights assistant. How can I help you today?" }
      ],
      inputValue: "",
      inputHtml: "",
      isSending: false
    };
  }

  handleEditableInput = () => {
    if (!this.editableRef.current) return;
    
    let html = this.editableRef.current.innerHTML || "";
    // Normalize empty content (some browsers insert <br> or <div><br></div>)
    const normalized = html.trim().replace(/^<div><br><\/div>$|^<br>$/, "");
    if (normalized === "") {
      html = "";
      this.editableRef.current.innerHTML = "";
    }
    
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.innerText || div.textContent || "";
    this.setState({ inputHtml: html, inputValue: text });
  };

  handleEditablePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const htmlData = e.clipboardData.getData("text/html");
    const textData = e.clipboardData.getData("text/plain");
    
    if (htmlData) {
      // Insert HTML directly to preserve tables and formatting
      document.execCommand("insertHTML", false, htmlData);
    } else if (textData) {
      // Convert plain text with line breaks
      const formattedText = textData.replace(/\n/g, "<br>");
      document.execCommand("insertHTML", false, formattedText);
    }
    
    // Update state after paste
    setTimeout(() => this.handleEditableInput(), 0);
  };

  handleSend = async () => {
    const { inputValue, inputHtml } = this.state;
    if (!inputValue.trim()) return;

    // add user message
    this.setState(state => ({
      messages: [...state.messages, { speaker: "user", text: inputValue, html: inputHtml || undefined }],
      inputValue: "",
      inputHtml: "",
      isSending: true
    }));
    
    // Clear the contenteditable
    if (this.editableRef.current) {
      this.editableRef.current.innerHTML = "";
    }

    try {
      // Try sendQuery first if provided
      if (this.props.sendQuery) {
        const answer = await this.props.sendQuery(inputValue);
        this.setState(state => ({
          messages: [...state.messages, { speaker: "bot", text: String(answer ?? "") || "No answer returned" }],
          isSending: false
        }));
        return;
      }

      // Try API call if API key is provided
      if (this.props.apiKey) {
        const endpoint = "https://yourbackend.example.com/chat";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.props.apiKey}`
          },
          body: JSON.stringify({ query: inputValue })
        }).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)));

        const answer = (response && (response.answer ?? response.text ?? response.message)) || "No answer returned";
        this.setState(state => ({
          messages: [...state.messages, { speaker: "bot", text: String(answer) }],
          isSending: false
        }));
        return;
      }

      // Fallback interactive response when no API configured
      const lowerInput = inputValue.trim().toLowerCase();
      let response = "";
      
      if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        response = "Hello! How can I assist you today?";
      } else if (lowerInput.includes("help")) {
        response = "I'm here to help! You can ask me questions, and I'll do my best to assist you.";
      } else if (lowerInput.includes("thank")) {
        response = "You're welcome! Feel free to ask if you need anything else.";
      } else {
        response = `I received your message: "${inputValue}". This is a demo response. Configure an API to get real answers.`;
      }

      // Simulate a brief delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.setState(state => ({
        messages: [...state.messages, { speaker: "bot", text: response }],
        isSending: false
      }));
    } catch (err) {
      this.setState(state => ({
        messages: [...state.messages, { speaker: "bot", text: "Error: unable to get response" }],
        isSending: false
      }));
    }
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !this.state.isSending) {
      e.preventDefault();
      this.handleSend();
    }
  };

  componentDidUpdate() {
    if (this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  render() {
    return (
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="title">Insights Assistant</div>
          <div className="status">
            <span className={`status-dot ${this.state.isSending ? "busy" : "idle"}`} />
            <span className="status-text">{this.state.isSending ? "Sending" : "Ready"}</span>
          </div>
        </div>
        <div className="messages">
          {this.state.messages.map((m, i) => (
            <div key={i} className={`message ${m.speaker}`}>
              {m.html ? (
                <div 
                  className="message-content"
                  style={{ whiteSpace: "normal", overflowX: "auto" }}
                  dangerouslySetInnerHTML={{ __html: m.html }}
                />
              ) : (
                <span className="message-content" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</span>
              )}
            </div>
          ))}
          {this.state.isSending && (
            <div className="message bot typing">
              <span className="typing-dots"><i></i><i></i><i></i></span>
            </div>
          )}
          <div ref={this.messagesEndRef} />
        </div>
        <div className="input-area">
          <div
            ref={this.editableRef}
            className="rich-input"
            contentEditable={!this.state.isSending}
            onInput={this.handleEditableInput}
            onPaste={this.handleEditablePaste}
            onKeyDown={this.handleKeyDown}
            role="textbox"
            aria-multiline="true"
            aria-label="Chat message input"
            data-placeholder="Ask a question or type a message"
            suppressContentEditableWarning={true}
          />
          <button onClick={this.handleSend} disabled={this.state.isSending || !this.state.inputValue.trim()} aria-busy={this.state.isSending}>
            {this.state.isSending ? "Sending..." : "Send"}
          </button>
        </div>
        {this.props.apiKey && (
          <div className="skeleton-note">API Key set: ****{String(this.props.apiKey).slice(-4)}</div>
        )}
      </div>
    );
  }
}

export default ChatbotComponent;
