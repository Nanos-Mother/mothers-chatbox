function ChatBox.Create()
    ChatBox._WebUI = WebUI("Mother's Chatbox", "file://mothers/chatbox.html")
    ChatBox._WebUI:Subscribe("ChatboxVisibilityChanged", function(visible)
        if visible then
            Input.SetInputEnabled(false)
            Input.SetMouseEnabled(true)
            ChatBox._WebUI:CallEvent("focusInput")
            ChatBox._WebUI:SetFocus()
            ChatBox.CallEvent("Open")
        else
            Input.SetInputEnabled(true)
            Input.SetMouseEnabled(false)
            ChatBox._WebUI:RemoveFocus()
            ChatBox.CallEvent("Close")
        end
    end)

    ChatBox._WebUI:Subscribe("MessageEntry", function(msg)
        msg = string.Trim(msg)
        if msg ~= "" then
            ChatBox.SendMessage(msg)
        end
        ChatBox._WebUI:CallEvent("setChatboxVisible", false)
    end)

    ChatBox._WebUI:Subscribe("Load", function()
        local mixin = Blueprint(Vector(), Rotator(), "mothers-chatbox::BP_ChatBoxMixin")
        mixin:CallBlueprintEvent("RemoveChatbox")
        mixin:Destroy()

        ChatBox._WebUI:CallEvent("setTitle", Client.GetValue("ChatBox.Title", "Mother's Chatbox"))

        print("Replaced Chatbox with Mother's Chatbox")
    end)
end

Client.Subscribe("SpawnLocalPlayer", function()
    ChatBox.Create()
end)

Package.Subscribe("Load", function()
    ChatBox.Create()
end)

-- Override default input events
Input.Bind("Chat", InputEvent.Pressed, function()
    if ChatBox._WebUI then
        ChatBox._WebUI:CallEvent("toggleChatbox")
    end
end)

-- Let's use default chat events to handle things yet
Chat.Subscribe("ChatEntry", function(msg, ply)
    if ChatBox then
        if ply and ply:IsValid() then
            ChatBox._WebUI:CallEvent("addMessage", msg, ply:GetName(), ply:GetAccountIconURL())
        else
            ChatBox._WebUI:CallEvent("addMessage", msg)
        end
    end
end)