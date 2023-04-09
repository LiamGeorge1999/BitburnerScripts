

export class ExpressionEvaluator {

	static evaluate(statement: string): number {
        statement = statement.replace(/\s/g, "");
		var lastOpenBracketIndex = statement.lastIndexOf("(");
		if (lastOpenBracketIndex != -1) {
			var correspondingCloseBracketIndex = statement.indexOf(")", lastOpenBracketIndex);

			return this.evaluate(statement.slice(0, lastOpenBracketIndex) + this.evaluate(statement.slice(lastOpenBracketIndex + 1, correspondingCloseBracketIndex)).toString() + statement.slice(correspondingCloseBracketIndex + 1));

		}
        var operatorIndex = statement.indexOf("+");
        if (operatorIndex != -1) return this.evaluate(statement.slice(0, operatorIndex)) + this.evaluate(statement.slice(operatorIndex + 1)); 
        var operatorIndex = statement.indexOf("-");
        if (operatorIndex != -1) return this.evaluate(statement.slice(0, operatorIndex)) - this.evaluate(statement.slice(operatorIndex + 1));
        var operatorIndex = statement.indexOf("*");
        if (operatorIndex != -1) return this.evaluate(statement.slice(0, operatorIndex)) * this.evaluate(statement.slice(operatorIndex + 1));
        var operatorIndex = statement.indexOf("/");
        if (operatorIndex != -1) return this.evaluate(statement.slice(0, operatorIndex)) / this.evaluate(statement.slice(operatorIndex + 1));
        console.log(`found ${Number.parseInt(statement)}`);
		return Number.parseInt(statement);
	}
}