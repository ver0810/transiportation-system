// frontend/src/services/websocket.ts

type WebSocketCallback = (data: any) => void;
type DisconnectHandler = () => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private reconnectTimer: number | null = null;
    private url: string;
    private callbacks: WebSocketCallback[] = [];
    private disconnectHandlers: DisconnectHandler[] = [];
    private isConnecting: boolean = false;
    private maxReconnectAttempts: number = 5;
    private reconnectAttempts: number = 0;

    constructor(url: string) {
        this.url = url;
    }

    // 连接WebSocket
    connect(): Promise<void> {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return Promise.resolve();
        }

        if (this.isConnecting) {
            return Promise.resolve();
        }

        this.isConnecting = true;

        return new Promise((resolve, reject) => {
            try {
                // 为防止资源泄漏，确保旧连接已关闭
                if (this.socket) {
                    this.socket.close();
                    this.socket = null;
                }
                
                this.socket = new WebSocket(this.url);

                this.socket.onopen = () => {
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        window.requestAnimationFrame(() => {
                            this.callbacks.forEach(callback => callback(data));
                        });
                    } catch (error) {
                        console.error('解析WebSocket数据失败:', error);
                    }
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket错误:', error);
                    this.isConnecting = false;
                    reject(error);
                };

                this.socket.onclose = (event) => {
                    this.isConnecting = false;
                    this.socket = null;
                    this.disconnectHandlers.forEach(handler => handler());
                    if (event.code !== 1000) {
                        this.reconnect();
                    }
                };
            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    private reconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }
        
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectAttempts++;
            this.connect().catch(() => {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnect();
                }
            });
        }, delay);
    }

    // 添加数据回调
    addCallback(callback: WebSocketCallback): void {
        if (!this.callbacks.includes(callback)) {
            this.callbacks.push(callback);
        }
    }

    // 移除数据回调
    removeCallback(callback: WebSocketCallback): void {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }
    
    // 添加断开连接处理程序
    addDisconnectHandler(handler: DisconnectHandler): void {
        if (!this.disconnectHandlers.includes(handler)) {
            this.disconnectHandlers.push(handler);
        }
    }
    
    // 移除断开连接处理程序
    removeDisconnectHandler(handler: DisconnectHandler): void {
        this.disconnectHandlers = this.disconnectHandlers.filter(h => h !== handler);
    }

    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.close(1000, "正常关闭");
            this.socket = null;
        }
        
        this.reconnectAttempts = 0;
    }

    send(data: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket未连接，无法发送消息');
        }
    }

    isConnected(): boolean {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }
}

// 创建各种数据的WebSocket服务实例
const baseUrl =
    import.meta.env.VITE_WS_BASE_URL?.trim() || "ws://127.0.0.1:8000/ws";

export const roadFlowSocket = new WebSocketService(`${baseUrl}/road_flow`);
export const trafficEventsSocket = new WebSocketService(`${baseUrl}/traffic_events`);
export const districtDataSocket = new WebSocketService(`${baseUrl}/district_data`);
export const statisticsSocket = new WebSocketService(`${baseUrl}/statistics`);
export const trendDataSocket = new WebSocketService(`${baseUrl}/trend_data`);
export const predictionDataSocket = new WebSocketService(`${baseUrl}/prediction_data`);
export const hotspotsDataSocket = new WebSocketService(`${baseUrl}/hotspots_data`);
export const allDataSocket = new WebSocketService(`${baseUrl}/all_data`);

export default WebSocketService;
