import pandas as pd


def load_excel(file_path: str) -> pd.DataFrame:
    return pd.read_excel(file_path)


def get_schema(df: pd.DataFrame) -> dict:

    return {
        "columns": df.columns.tolist(),
        "row_count": len(df),
        "data_types": {
            column: str(dtype)
            for column, dtype in df.dtypes.items()
        }
    }


def analyze_sales(
    df: pd.DataFrame,
    operation: str,
    column: str | None = None,
    group_by: str | None = None,
    limit: int = 5
):

    if column and column not in df.columns:
        raise ValueError(
            f"Column '{column}' does not exist."
        )

    if group_by and group_by not in df.columns:
        raise ValueError(
            f"Column '{group_by}' does not exist."
        )

    # Total
    if operation == "sum":

        if not column:
            raise ValueError("Column is required.")

        return {
            "value": float(df[column].sum())
        }

    # Average
    if operation == "average":

        if not column:
            raise ValueError("Column is required.")

        return {
            "value": float(df[column].mean())
        }

    # Maximum
    if operation == "max":

        if not column:
            raise ValueError("Column is required.")

        row = df.loc[df[column].idxmax()]

        return row.to_dict()

    # Minimum
    if operation == "min":

        if not column:
            raise ValueError("Column is required.")

        row = df.loc[df[column].idxmin()]

        return row.to_dict()

    # Top products
    if operation == "top":

        if not column:
            raise ValueError("Column is required.")

        result = (
            df.groupby(group_by)[column]
            .sum()
            .sort_values(ascending=False)
            .head(limit)
        )

        return result.to_dict()

    # Count
    if operation == "count":

        return {
            "count": int(len(df))
        }

    raise ValueError(
        f"Unsupported operation: {operation}"
    )