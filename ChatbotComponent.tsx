import * as React from "react";

interface Message {
  speaker: "user" | "bot";
  text: string;
  html?: string;
}

interface ChatbotProps {
  apiKey?: string;
  userId?: string;
  sendQuery?: (query: string) => Promise<string>;
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
        { speaker: "bot", text: "👋 Hi there! I’m your insights assistant. What would you like to explore today?" }
      ],
      inputValue: "",
      inputHtml: "",
      isSending: false
    };
  }

  handleEditableInput = () => {
    if (!this.editableRef.current) return;
    const html = this.editableRef.current.innerHTML || "";
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
      document.execCommand("insertHTML", false, htmlData);
    } else if (textData) {
      const formattedText = textData.replace(/\n/g, "<br>");
      document.execCommand("insertHTML", false, formattedText);
    }
    setTimeout(() => this.handleEditableInput(), 0);
  };

  handleSend = async () => {
    const { inputValue, inputHtml } = this.state;
    if (!inputValue.trim()) return;

    this.setState(state => ({
      messages: [...state.messages, { speaker: "user", text: inputValue, html: inputHtml || undefined }],
      inputValue: "",
      inputHtml: "",
      isSending: true
    }));

    if (this.editableRef.current) this.editableRef.current.innerHTML = "";

    try {
      const normalized = inputValue.trim().toLowerCase();
      let answer = "";

      const isGreeting = /\b(?:hi|hello|hey)\b/i.test(normalized);
      if (isGreeting) {
        answer = "Hello! I’m your insights assistant 👋";
      } else {
        answer = "The API should be set up to handle your request.";
      }

      this.setState(state => ({
        messages: [...state.messages, { speaker: "bot", text: answer }],
        isSending: false
      }));
    } catch {
      this.setState(state => ({
        messages: [...state.messages, { speaker: "bot", text: "⚠️ Oops! Something went wrong while processing." }],
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
      <div className="chatbot-container" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="messages">
          {this.state.messages.map((m, i) => (
            <div key={i} className={`message ${m.speaker}`}>
              {m.html ? (
                <div className="message-content" dangerouslySetInnerHTML={{ __html: m.html }} />
              ) : (
                <span className="message-content">{m.text}</span>
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
            data-placeholder="Ask a question or type a message"
            suppressContentEditableWarning={true}
          />
          <button onClick={this.handleSend} disabled={this.state.isSending || !this.state.inputValue.trim()}>
            {this.state.isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    );
  }
}

export default ChatbotComponent;

