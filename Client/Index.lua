ChatBox = {}
Package.Require("WebUI.lua")

-- Same API as Nanos' Chat static class
function ChatBox.SendMessage(msg)
    local can = ChatBox.CallEvent("PlayerSubmit", msg)
    if can ~= false then
        Events.CallRemote("ChatBox.PlayerSubmit", msg)
    end
end

function ChatBox.AddMessage(msg, sender, avatar)
    if ChatBox._WebUI and ChatBox._WebUI:IsValid() then
        ChatBox._WebUI:CallEvent("addMessage", msg, sender, avatar)
    end
end
Events.SubscribeRemote("ChatBox.AddMessage", ChatBox.AddMessage)

Events.SubscribeRemote("ChatBox.ReceiveMessage", function(msg, ply)
    ChatBox.CallEvent("ChatEntry", msg, ply)

    if ply and ply:IsValid() then
        ChatBox.AddMessage(msg, ply:GetName(), ply:GetAccountIconURL())
    else
        ChatBox.AddMessage(msg)
    end
end)

function ChatBox.Clear()
    ChatBox._WebUI:CallEvent("clearMessages")
end

function ChatBox.SetVisibility(visible)
    if ChatBox._WebUI then
        ChatBox._WebUI:SetVisibility(visible and WidgetVisibility.Visible or WidgetVisibility.Hidden)
    end
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
            local result = callback(...)
            if result ~= nil then
                return result
            end
        end
    end
end

Chat.Subscribe("ChatEntry", function(msg, ply)
    if ply and ply:IsValid() then
        ChatBox.AddMessage(msg, ply:GetName(), ply:GetAccountIconURL())
    else
        ChatBox.AddMessage(msg)
    end
end)