//
//  PatternManager.m
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import "PatternManager.h"
#import <CommonCrypto/CommonHMAC.h>

NSString *const kPatternKey = @"patternKey";

@interface PatternManager ()
@property (nonatomic, strong) NSArray *storedpattern;
@property (nonatomic, strong) NSString *stored256;
@end

@implementation PatternManager

+ (instancetype)sharedManager {
    static PatternManager *singleton = nil;
    static dispatch_once_t onceToken;
    
    dispatch_once(&onceToken, ^{
        singleton = [[self alloc] init];
    });
    
    return singleton;
}

- (BOOL)isCorrectPattern:(NSArray *)pattern {
    if (self.stored256)
    {
        NSString *pattern256 = [self sha256:[pattern jsonString]];
        return [self.stored256 isEqualToString:pattern256];
    }
    else
    {
        return YES;
    }
}

- (BOOL)pattern:(NSArray *)pattern1 isEqualToPattern:(NSArray *)pattern2 {
    return [pattern1 isEqualToArray:pattern2];
}

- (NSArray *)storedpattern {
    if (!_storedpattern) {
        _storedpattern = [[NSUserDefaults standardUserDefaults] objectForKey:kPatternKey];
    }
    return _storedpattern;
}

- (NSString *)stored256 {
    if (!_stored256) {
        _stored256 = [[NSUserDefaults standardUserDefaults] objectForKey:kPatternKey];
    }
    return _stored256;
}


- (void)updatePattern:(NSArray *)pattern {
    self.storedpattern = [pattern copy];
    self.stored256 = [self sha256:[self.storedpattern jsonString]];
    [[NSUserDefaults standardUserDefaults] setObject:self.stored256 forKey:kPatternKey];
}

- (void)deletePattern {
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:kPatternKey];
}

-(NSString*)sha256:(NSString *)plain
{
    NSData *data = [plain dataUsingEncoding:NSUTF8StringEncoding];
    uint8_t digest[CC_SHA256_DIGEST_LENGTH]={0};
    CC_SHA256(data.bytes, data.length, digest);
    NSData *out = [NSData dataWithBytes:digest length:CC_SHA256_DIGEST_LENGTH];
    NSString *hash=[out description];
    hash = [hash stringByReplacingOccurrencesOfString:@" " withString:@""];
    hash = [hash stringByReplacingOccurrencesOfString:@"<" withString:@""];
    hash = [hash stringByReplacingOccurrencesOfString:@">" withString:@""];
    
    return hash;
}

@end
