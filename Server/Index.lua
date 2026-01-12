ChatBox = {}

-- Same API as Nanos' Chat static class
function ChatBox.BroadcastMessage(msg)
    Events.Broadcast("ChatBox.AddMessage", msg)
end

function ChatBox.SendMessage(ply, msg)
    Events.CallRemote("ChatBox.ReceiveMessage", msg)
end

-- Events handling
ChatBox._Events = {}

function ChatBox.Subscribe(event, callback)
    ChatBox._Events[event] = ChatBox._Events[event] or {}
    ChatBox._Events[event][#ChatBox._Events[event] + 1] = callback
end

function ChatBox.CallEvent(event, ...)
    if ChatBox._Events[event] then
        for _, callback in ipairs(ChatBox._Events[event]) do
            callback(...)
        end
    end
end

Events.SubscribeRemote("ChatBox.SendMessage", function(ply, msg)
    Events.BroadcastRemote("ChatBox.ReceiveMessage", msg, ply)
end)

Events.SubscribeRemote("ChatBox.PlayerSubmit", function(ply, msg)
    local can = ChatBox.CallEvent("PlayerSubmit", msg, ply)
    if can ~= false then
        Events.BroadcastRemote("ChatBox.ReceiveMessage", msg, ply)
    end
end)

-- Custom API methods
function Player:Say(msg)
    Events.BroadcastRemote("ChatBox.ReceiveMessage", msg, self)
end

Package.Subscribe("Load", function()
    Server.SetValue("ChatBox.Title", Server.GetName(), true)
end)