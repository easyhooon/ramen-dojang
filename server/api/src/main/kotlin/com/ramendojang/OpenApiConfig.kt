package com.ramendojang

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Contact
import io.swagger.v3.oas.annotations.info.Info
import io.swagger.v3.oas.annotations.info.License
import org.springframework.context.annotation.Configuration

@Configuration
@OpenAPIDefinition(
    info = Info(
        title = "라멘 도장깨기 API",
        version = "0.1.0",
        description = "라멘집, 방문 기록, 위시리스트를 관리하는 웹 우선 서비스 API입니다.",
        contact = Contact(name = "ramen-dojang"),
        license = License(name = "MIT", identifier = "MIT"),
    ),
)
class OpenApiConfig
