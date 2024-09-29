//
//  SamplePassCodeViewController.m
//

#import "SamplePassCodeViewController.h"

@interface SamplePassCodeViewController () <UIAlertViewDelegate> {
}

@property (nonatomic, strong) IBOutlet UIView *indicatorView1;
@property (nonatomic, strong) IBOutlet UIView *indicatorView2;
@property (nonatomic, strong) IBOutlet UIView *indicatorView3;
@property (nonatomic, strong) IBOutlet UIView *indicatorView4;

@property (nonatomic, strong) IBOutlet UIImageView *indicator1;
@property (nonatomic, strong) IBOutlet UIImageView *indicator2;
@property (nonatomic, strong) IBOutlet UIImageView *indicator3;
@property (nonatomic, strong) IBOutlet UIImageView *indicator4;

@end

@implementation SamplePassCodeViewController

- (void)loadView {
    [super loadView];
    
    _passmode = PassCodeModeUnset;

    self.indicatorView1.layer.cornerRadius = 8.0f;
    self.indicatorView2.layer.cornerRadius = 8.0f;
    self.indicatorView3.layer.cornerRadius = 8.0f;
    self.indicatorView4.layer.cornerRadius = 8.0f;
}

- (void)viewWillAppear:(BOOL)animated {
	[super viewWillAppear:animated];
}

- (void)setCodeCount:(NSInteger)codeCount {
    [super setCodeCount:codeCount];
    self.indicator1.hidden = self.codeCount >= 1 ? NO : YES;
    self.indicator2.hidden = self.codeCount >= 2 ? NO : YES;
    self.indicator3.hidden = self.codeCount >= 3 ? NO : YES;
    self.indicator4.hidden = self.codeCount >= 4 ? NO : YES;
}

- (void)showMode:(NSString *)mode {
    [super showMode:mode];

    if ( [mode isEqualToString:@"REGISTER"] ) {
        [self updateMode:PassCodeRegisterMode];
    }
    else if ( [mode isEqualToString:@"SETTING_REGISTER"] ) {
        [self updateMode:PassCodeRegisterMode];
    }
    else if ( [mode isEqualToString:@"SETTING_CHANGE"] ) {
        [self updateMode:PassCodeChangeMode];
    }
    else if ( [mode isEqualToString:@"LOGIN"] || [mode isEqualToString:@"AUTH"] )
    {
        if([[PassCodeManager defaultManager] hasPassCode])
        {
            _retryCount = 0;
            [self updateMode:PassCodeAuthMode];
        }
        else
        {
            [self authFailAction];
        }
    }
    else
    {
        [self dismiss];
    }
}

- (void)updateMode:(PassCodeMode)mode
{
    _passmode = mode;
    switch (mode) {
        default:
        case PassCodeModeUnset:
            self.labelMessage.text = @"-";
            self.lockedInteraction = NO;
            break;

        case PassCodeRegisterMode:
        case PassCodeRegisterModeNewPassCode:
            self.labelMessage.text = @"새로운 비밀번호를 입력하십시오";
            self.lockedInteraction = NO;
            break;

        case PassCodeRegisterModeConfirmPassCode:
            self.labelMessage.text = @"비밀번호를 한번 더 입력하십시오";
            self.lockedInteraction = NO;
            break;

        case PassCodeRegisterModeWrongConfirmPassCode:
            self.labelMessage.text = @"일지하지 않음. 새로운 비밀번호 다시 입력.";
            self.lockedInteraction = NO;
            break;

        case PassCodeRegisterModeDone: {
            UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"" message:@"로그인 비밀번호를 설정하였습니다." delegate:self cancelButtonTitle:@"확인" otherButtonTitles:nil, nil];
            [alertView setTag:PassCodeRegisterModeDone];
            [alertView show];
        }
            break;

        case PassCodeChangeModeOldPassCode:
            self.labelMessage.text = @"기존 비밀번호를 입력하십시오";
            self.lockedInteraction = NO;
            break;

        case PassCodeChangeModeWrongOldPassCode:
            self.labelMessage.text = @"비밀번호가 일치하지 않습니다";
            self.lockedInteraction = NO;
            break;

        case PassCodeChangeMode:
        case PassCodeChangeModeNewPassCode:
            self.labelMessage.text = @"새로운 비밀번호를 입력하십시오";
            self.lockedInteraction = NO;
            break;

        case PassCodeChangeModeConfirmPassCode:
            self.labelMessage.text = @"비밀번호를 한번 더 입력하십시오";
            self.lockedInteraction = NO;
            break;

        case PassCodeChangeModeWrongConfirmPassCode:
            self.labelMessage.text = @"일지하지 않음. 새로운 비밀번호 다시 입력.";
            self.lockedInteraction = NO;
            break;

        case PassCodeChangeModeDone: {
            UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"" message:@"로그인 비밀번호를 설정하였습니다." delegate:self cancelButtonTitle:@"확인" otherButtonTitles:nil, nil];
            [alertView setTag:PassCodeChangeModeDone];
            [alertView show];
        }
            break;

        case PassCodeAuthMode:
        case PassCodeAuthModeInput:
            self.labelMessage.text = @"비밀번호를 입력해 주십시오";
            self.lockedInteraction = NO;
            break;

        case PassCodeAuthModeWrong:
            [self startShakingAnimation];
            self.labelMessage.text = @"로그인 비밀번호가 일치하지 않습니다";
            self.lockedInteraction = NO;
            break;

        case PassCodeAuthModeFail: {
            UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"" message:@"로그인 비밀번호를 3회 틀렸습니다.\n다시 로그인해 주시기 바랍니다." delegate:self cancelButtonTitle:@"확인" otherButtonTitles:nil, nil];
            [alertView setTag:PassCodeAuthModeFail];
            [alertView show];
        }
            break;

        case PassCodeAuthModeDone:

            [self authDoneAction];

            break;
    }

}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {

    if ( alertView.tag == PassCodeRegisterModeDone ) {

        if ( [self.mode isEqualToString:@"REGISTER"] ) {
            [self registerDoneAction];
        }
        else {
            [self resetDoneAction];
        }
    }
    else if ( alertView.tag == PassCodeChangeModeDone ) {

        [self resetDoneAction];
    }
    else if ( alertView.tag == PassCodeAuthModeFail ) {

        [self authFailAction];
    }
}

- (void)afterAction {
    NSString *inputPassCode = [self.passNumbers componentsJoinedByString:@""];
    if ( _passmode >= PassCodeRegisterMode && _passmode <= PassCodeRegisterModeDone ) {

        if ( _passmode == PassCodeRegisterMode || _passmode == PassCodeRegisterModeNewPassCode || self.firstPassCode == nil ) {
            self.firstPassCode = [[NSString alloc] initWithString:inputPassCode];

            [self updateMode:PassCodeRegisterModeConfirmPassCode];
        }
        else if ( _passmode == PassCodeRegisterModeConfirmPassCode || _passmode == PassCodeRegisterModeWrongConfirmPassCode ) {

            if ( ! [self.firstPassCode isEqualToString:inputPassCode] ) {
                self.firstPassCode = nil;

                [self updateMode:PassCodeRegisterModeWrongConfirmPassCode];
            }
            else {
                [[PassCodeManager defaultManager] registerPassCode:inputPassCode];

                [self updateMode:PassCodeRegisterModeDone];
            }
        }

    }
    else if ( _passmode >= PassCodeChangeMode && _passmode <= PassCodeChangeModeDone )
    {
        if ( _passmode == PassCodeChangeMode || _passmode == PassCodeChangeModeNewPassCode || self.firstPassCode == nil ) {
            self.firstPassCode = [[NSString alloc] initWithString:inputPassCode];

            [self updateMode:PassCodeChangeModeConfirmPassCode];
        }
        else if ( _passmode == PassCodeChangeModeConfirmPassCode || _passmode == PassCodeChangeModeWrongConfirmPassCode ) {
            if ( ! [self.firstPassCode isEqualToString:inputPassCode] ) {
                self.firstPassCode = nil;

                [self updateMode:PassCodeChangeModeWrongConfirmPassCode];
            }
            else {
                [[PassCodeManager defaultManager] registerPassCode:inputPassCode];

                [self updateMode:PassCodeChangeModeDone];
            }
        }
    }
    else if ( _passmode >= PassCodeAuthMode && _passmode <= PassCodeAuthModeDone )
    {
        if ( _passmode == PassCodeAuthMode || _passmode == PassCodeAuthModeInput || _passmode == PassCodeAuthModeWrong ) {

            if ( ! [[PassCodeManager defaultManager] validPassCode:inputPassCode] ) {

                _retryCount += 1;

                if ( _retryCount >= 3 ) {
                    [self updateMode:PassCodeAuthModeFail];

                    return;
                }

                [self updateMode:PassCodeAuthModeWrong];
            }
            else {

                [self updateMode:PassCodeAuthModeDone];
            }
        }
    }
}

@end
