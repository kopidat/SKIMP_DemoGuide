//
//  SamplePassCodeViewController.h
//

#import <UIKit/UIKit.h>
#import "PassCodeViewController.h"

typedef NS_ENUM(NSInteger, PassCodeMode ){
    PassCodeModeUnset = 0,

    PassCodeRegisterMode = 10,
    PassCodeRegisterModeNewPassCode = 11,
    PassCodeRegisterModeConfirmPassCode = 12,
    PassCodeRegisterModeWrongConfirmPassCode = 13,
    PassCodeRegisterModeDone = 19,

    PassCodeChangeMode = 20,
    PassCodeChangeModeOldPassCode = 21,
    PassCodeChangeModeWrongOldPassCode = 22,
    PassCodeChangeModeNewPassCode = 23,
    PassCodeChangeModeConfirmPassCode = 24,
    PassCodeChangeModeWrongConfirmPassCode = 25,
    PassCodeChangeModeDone = 29,

    PassCodeAuthMode = 40,
    PassCodeAuthModeInput = 41,
    PassCodeAuthModeWrong = 42,
    PassCodeAuthModeFail = 43,
    PassCodeAuthModeDone = 49
};

@interface SamplePassCodeViewController : PassCodeViewController
{
    PassCodeMode _passmode;
}

@end
