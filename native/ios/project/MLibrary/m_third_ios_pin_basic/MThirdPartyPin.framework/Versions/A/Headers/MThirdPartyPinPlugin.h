//
//  MThirdPartyPinPlugin.h
//

#import <Foundation/Foundation.h>

@interface MThirdPartyPinPlugin : MPlugin

+ (MThirdPartyPinPlugin *)getInstance;

@end

#define PLUGIN_CLASS    MThirdPartyPinPlugin
#define PLUGIN_BUNDLE   @"MThirdPartyPin.bundle"

#define PGResource(res) [PLUGIN_BUNDLE appendPath:res]
#define PGLocalizedString(key, comment) [PLUGIN_CLASS localizedStringForKey:(key)]
