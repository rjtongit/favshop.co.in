from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str

    cors_origins: str = (
        "http://localhost:4200,http://localhost:4300"
    )

    # Hugging Face API Key
    huggingface_api_key: str = ""
    groq_api_key: str = ""
    tavily_api_key: str = ""
    # Legacy Razorpay settings
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    # Fastrr / Shiprocket Checkout
    shiprocket_checkout_api_key: str = ""
    shiprocket_checkout_api_secret: str = ""

    shiprocket_checkout_base_url: str = (
        "https://checkout-api.shiprocket.com"
    )

    shiprocket_checkout_timeout: int = 20

    fastrr_redirect_url: str = (
        "http://localhost:4200/checkout/success"
    )

    fastrr_default_product_image_url: str = (
        "https://placehold.co/600x600/png?text=FavShop"
    )

    public_api_url: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
