/**
 * ffxivCompanionTwitch.js
 *
 * This module will act as a smart companion providing useful information
 * related to Final Fantasy XIV using the XIVAPI (https://xivapi.com/)
 * 
 * Original author: Onigiri070 (rpgPilgrim)
 * 
 */

(function() {
    
    // Global variable definition
    var apiURI = "https://xivapi.com/",
        charID = '',
        charURL = '',
        charName = '',
        profileURL = '',
        active = $.getIniDbString('activeTable', 'current', 'unset'),
        region = $.getIniDbString('regionTable', 'currentRegion', 'unset');
        
    // regionSwitch 
    // Changes the active region. Performs a check to verify the given region is valid. 
    function regionSwitch(args) {
        var regionArr = ["NA", "EU", "JP"];
        // Using .indexOf() we can check if the argument exists within the array
        if (regionArr.indexOf(String(args[0].toUpperCase())) !== -1) {
            region = String(args[0].toUpperCase());
            $.setIniDbString('regionTable', 'currentRegion', region);
            $.say($.lang.get('ffxivtwitch.region.success', region));
        } else {
            $.say($.lang.get('ffxivtwitch.region.invalid'));
        }
    }

    // activeChar
    // Sets active character in database
    function activeChar(argStr) {
        active = argStr;
        var server = argStr[2];
        $.setIniDbString('activeTable', 'current', active);
        $.say($.lang.get('ffxivtwitch.active.success', active, server));
    }
    
    // charSearch
    // Query the API for character data based on name and server 
    function charSearch(charFirst, charLast, server) {
        var charQueryURL = apiURI + "character/search?name=" + charFirst + "+" + charLast + "&server=" + server,
            resultsJSON = JSON.parse($.customAPI.get(charQueryURL).content);
        // Success check
        if (resultsJSON.Pagination.Results <= 0) {
            $.say($.lang.get('ffxivtwitch.charsearch.notfound'));
            return;
        } else if (resultsJSON.Pagination.Results > 1) {
            $say($.lang.get('ffxivtwitch.charsearch.multiple'));
            return;
        } else if (resultsJSON.Pagination.Results == 1) {
            // Store character summary data in variables
            charID = resultsJSON.Results[0].ID;
            charName = resultsJSON.Results[0].Name;
            //var charAvatar = resultsJSON.Results[0].Avatar,
            //    charRank = resultsJSON.Results[0].Rank,
            //    charRankIcon = resultsJSON.Results[0].RankIcon,
            //    charServer = resultsJSON.Results[0].Server;
            // Generate Profile URL 
            charURL = "https://" + region.toLowerCase() + ".finalfantasyxiv.com/lodestone/character/" + charID;
        }
    }

    // charReg
    // Sets persistent data for registered characters
    function charReg(charFirst, charURL) {
        $.setIniDbString('characterTable', charFirst, charURL);
        $.setIniDbString('characterNameTable', charFirst, charName);
    }
    
    // Event handling        
    $.bind('command', function(event) {
    	var command = event.getCommand(),
            sender = event.getSender(),
            args = event.getArgs(),
            argStr = String(event.getArguments());
        
        // !xivregion command
        if (command.equalsIgnoreCase('xivregion')) {
            if (args.length < 1) {
                $.say($.lang.get('ffxivtwitch.region.current', region)); 
                return;
            } else {
                regionSwitch(args);
            }
        }

        // !setactive command
        if (command.equalsIgnoreCase('setactive')) {
            if (args.length !== 3) {
                $.say($.lang.get('ffxivtwitch.active.usage'));
                return;
            } else {
                activeChar(argStr);
            }
        }

        // !active command
        if (command.equalsIgnoreCase('active')) {
            if (args.length > 1) {
                $.say($.lang.get('ffxivtwitch.active.limit'));
                return;
            } else {
                var activeArr = active.split(' ');
                $.say($.lang.get('ffxivtwitch.active.current', activeArr[0], activeArr[1], activeArr[2]));
            }
        }

        // !findchar command        
        if (command.equalsIgnoreCase('findchar')) {
            if (args.length !== 3) {
                $.say($.lang.get('ffxivtwitch.charsearch.usage'));
                return;
            } else {
                var charFirst = String(args[0]).toLowerCase(),
                    charLast = String(args[1]).toLowerCase(),
                    server = String(args[2]).toLowerCase();
                charSearch(charFirst, charLast, server);
                $.say($.lang.get('ffxivtwitch.charsearch.found', charName, charURL));
            }
        }

        // !xivregister command        
        if (command.equalsIgnoreCase('xivregister')) {
            if (args.length !== 3) {
                $.say($.lang.get('ffxivtwitch.charreg.usage'));
                return;
            } else {
                var charFirst = String(args[0]).toLowerCase(),
                    charLast = String(args[1]).toLowerCase(),
                    server = String(args[2]).toLowerCase();
                charSearch(charFirst, charLast, server);
                charReg(charFirst, charURL);
                $.say($.lang.get('ffxivtwitch.charreg.success', charName, charFirst));
            }
        }

        // !profile command
        if (command.equalsIgnoreCase('profile')) {
            if (args.length !== 1) {
                // TODO - Run on active character if no params
                $.say($.lang.get('ffxivtwitch.profile.usage'));
            } else {
                profileURL = $.getIniDbString('characterTable', args[0]);
                charName = $.getIniDbString('characterNameTable', args[0]);
                $.say($.lang.get('ffxivtwitch.profile.success', charName, profileURL));
            }
        }
    });

    /**
     * Permission group ID according to IllusionaryOne:
     * https://community.phantom.bot/t/setting-permission-for-a-command/4855
     * 
     * 0 = Broadcaster
     * 1 = Admin
     * 2 = Moderator
     * 3 = Subscriber
     * 4 = N/A
     * 5 = N/A
     * 6 = Regular
     * 7 = Viewer
     */
    $.bind('initReady', function() {
        $.registerChatCommand('./custom/ffxivCompanionTwitch.js', 'xivregion', 2);
        $.registerChatCommand('./custom/ffxivCompanionTwitch.js', 'xivregister', 2);
        $.registerChatCommand('./custom/ffxivCompanionTwitch.js', 'setactive', 2);
        $.registerChatCommand('./custom/ffxivCompanionTwitch.js', 'active', 7);
        $.registerChatCommand('./custom/ffxivCompanionTwitch.js', 'findchar', 7);
        $.registerChatCommand('./custom/ffxivCompanionTwitch.js', 'profile', 7);
    });
})();
