//
//  Utils.m
//  MOBILE_KOREA_MAIL.iOS
//
//  Created by kang on 2017. 9. 14..
//
//

#import "Utils.h"

@implementation Utils

+(BOOL)point:(CGPoint)intermediatePoint liesInJoinofPoint1:(CGPoint)point1 point2:(CGPoint)point2 {
    
    if (CGPointEqualToPoint(intermediatePoint, point1) || CGPointEqualToPoint(intermediatePoint, point2)) {
        return NO;
    }
    
    CGFloat minx = MIN(point1.x, point2.x);
    CGFloat maxx = MAX(point1.x, point2.x);
    CGFloat miny = MIN(point1.y, point2.y);
    CGFloat maxy = MAX(point1.y, point2.y);
    
    if (!([self isValue:intermediatePoint.x betweenMin:minx max:maxx] && [self isValue:intermediatePoint.y betweenMin:miny max:maxy])) {
        return NO;
    }
    
    CGFloat dx = (point2.x - point1.x);
    CGFloat dy = (point2.y - point1.y);
    
    if (dx != 0) {
        CGFloat slope = dy/dx;
        CGFloat constant = point1.y - slope * point1.x;
        return (intermediatePoint.y == (slope * intermediatePoint.x) + constant);
    } else {
        return (intermediatePoint.x == point1.x);
    }
}

+(BOOL)isValue:(CGFloat)value betweenMin:(CGFloat)min max:(CGFloat)max {
    return ((value >= min) && (value <= max));
}

@end
