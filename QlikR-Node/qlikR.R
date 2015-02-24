putDataR <- function (jsonObj) {
	require('RJSONIO')
	o = fromJSON(jsonObj)
	dfname <- paste(o$dataframeName,o$appId,sep="_")
	saved_file_name <- paste("c:/Users/cls/Documents/Node/qlikR/qliktest-",dfname,".Rda", sep="")
	
	qliktablejson <- fromJSON(jsonObj)

	tempdf <- data.frame(qliktablejson)

	tempdfsummary <- sd(tempdf$eCodeValue)

	qliktable <- unlist(qliktablejson)
	assign(dfname,qliktable,envir=globalenv())
	save(qliktablejson,file=saved_file_name)
	myjson <- toJSON(tempdfsummary)

    return(myjson)
}