//
//  PatternManager.h
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import <Foundation/Foundation.h>

@interface PatternManager : NSObject

+(instancetype)sharedManager;
- (BOOL)isCorrectPattern:(NSArray *)pattern;
- (void)updatePattern:(NSArray *)pattern;
- (BOOL)pattern:(NSArray *)pattern1 isEqualToPattern:(NSArray *)pattern2;
- (void)deletePattern;

@end
