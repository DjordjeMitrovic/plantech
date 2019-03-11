var dateFormat = require('dateformat');
module.exports = class ODDataValues {
    constructor(DataValue, DateTimeUTC, DerivedValueJobID, DerivedValuePriority, DerivedValueStatus, LocalDateTime, QualifierID, SelectedSuperSeriesID, SeriesID, SyncTS, UTCOffset, ValueAccuracy, ValueAccuracyReliability, ValueAccuracySchema, ValueAccuracyStatus, ValueID) {

        this.DataValue = DataValue;
        this.DateTimeUTC = DateTimeUTC;
        this.DerivedValueJobID = DerivedValueJobID;
        this.DerivedValuePriority = DerivedValuePriority;
        this.DerivedValueStatus = DerivedValueStatus;
        this.LocalDateTime = LocalDateTime;
        this.QualifierID = QualifierID;
        this.SelectedSuperSeriesID = SelectedSuperSeriesID;
        this.SeriesID = SeriesID;
        this.SyncTS = SyncTS;
        this.UTCOffset = UTCOffset;
        this.ValueAccuracy = ValueAccuracy;
        this.ValueAccuracyReliability = ValueAccuracyReliability;
        this.ValueAccuracySchema = ValueAccuracySchema;
        this.ValueAccuracyStatus = ValueAccuracyStatus;
        this.ValueID = ValueID;
    }
    gaussian(mean, stdev) {
        var y2;
        var use_last = false;
        return function () {
            var y1;
            if (use_last) {
                y1 = y2;
                use_last = false;
            }
            else {
                var x1, x2, w;
                do {
                    x1 = 2.0 * Math.random() - 1.0;
                    x2 = 2.0 * Math.random() - 1.0;
                    w = x1 * x1 + x2 * x2;
                } while (w >= 1.0);
                w = Math.sqrt((-2.0 * Math.log(w)) / w);
                y1 = x1 * w;
                y2 = x2 * w;
                use_last = true;
            }

            var retval = mean + stdev * y1;
            if (retval > 0)
                return retval;
            return -retval;
        }
    }



    getDataValue(merenja) {
        console.log(merenja);
        var pr = this.gaussian(5, 0.5);
        this.DataValue = {};
        var prolaz = merenja.indexOf('test') != -1;
        if (merenja.indexOf('C') != -1 || prolaz) this.DataValue.C = (pr() * 100) / 100;
        if (merenja.indexOf('N') != -1 || prolaz) this.DataValue.N = (pr() * 100) / 100;
        if (merenja.indexOf('O') != -1 || prolaz) this.DataValue.O = (pr() * 100) / 100;
        if (merenja.indexOf('H') != -1 || prolaz) this.DataValue.H = (pr() * 100) / 100;
        if (merenja.indexOf('S') != -1 || prolaz) this.DataValue.S = (pr() * 100) / 100;
        if (merenja.indexOf('Pi') != -1 || prolaz) this.DataValue.Pi = (pr() * 100) / 100;
        if (merenja.indexOf('Si') != -1 || prolaz) this.DataValue.Si = (pr() * 100) / 100;
        if (merenja.indexOf('Cl') != -1 || prolaz) this.DataValue.Cl = (pr() * 100) / 100;
        if (merenja.indexOf('Na') != -1 || prolaz) this.DataValue.Na = (pr() * 100) / 100;
        if (merenja.indexOf('Mg') != -1 || prolaz) this.DataValue.Mg = (pr() * 100) / 100;
        if (merenja.indexOf('Al') != -1 || prolaz) this.DataValue.Al = (pr() * 100) / 100;
        if (merenja.indexOf('Fe') != -1 || prolaz) this.DataValue.Fe = (pr() * 100) / 100;
        if (merenja.indexOf('Mn') != -1 || prolaz) this.DataValue.Mn = (pr() * 100) / 100;
        if (merenja.indexOf('moisture') != -1 || prolaz) this.DataValue.Vlaznost = (pr() * 100) / 100;

        console.log(JSON.stringify(this.DataValue));
        return JSON.stringify(this.DataValue);
    }

    setDataValue(dataValue) {
        this.DataValue = dataValue;
    }

    getDateTimeUTC() {
        this.DateTimeUTC = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        //console.log(this.DateTimeUTC);
        return this.DateTimeUTC;
    }

    setDateTimeUTC(dateTimeUTC) {
        this.DateTimeUTC = dateTimeUTC;
    }

    getDerivedValueJobID() {
        return this.DerivedValueJobID;
    }

    setDerivedValueJobID(derivedValueJobID) {
        this.DerivedValueJobID = derivedValueJobID;
    }

    getDerivedValuePriority() {
        return this.DerivedValuePriority;
    }

    setDerivedValuePriority(derivedValuePriority) {
        this.DerivedValuePriority = derivedValuePriority;
    }

    getDerivedValueStatus() {
        return this.DerivedValueStatus;
    }

    setDerivedValueStatus(derivedValueStatus) {
        this.DerivedValueStatus = derivedValueStatus;
    }

    getLocalDateTime() {
        return this.LocalDateTime;
    }

    setLocalDateTime(localDateTime) {
        this.LocalDateTime = localDateTime;
    }

    getQualifierID() {
        return this.QualifierID;
    }

    setQualifierID(qualifierID) {
        this.QualifierID = qualifierID;
    }

    getSelectedSuperSeriesID() {
        return this.SelectedSuperSeriesID;
    }

    setSelectedSuperSeriesID(selectedSuperSeriesID) {
        this.SelectedSuperSeriesID = selectedSuperSeriesID;
    }

    getSeriesID() {
        return this.SeriesID;
    }

    setSeriesID(seriesID) {
        this.SeriesID = seriesID;
    }

    getSyncTS() {
        return this.SyncTS;
    }

    setSyncTS(syncTS) {
        this.SyncTS = syncTS;
    }

    getUTCOffset() {
        return this.UTCOffset;
    }

    setUTCOffset(uTCOffset) {
        this.UTCOffset = uTCOffset;
    }

    getValueAccuracy() {
        return this.ValueAccuracy;
    }

    setValueAccuracy(valueAccuracy) {
        this.ValueAccuracy = valueAccuracy;
    }

    getValueAccuracyReliability() {
        return this.ValueAccuracyReliability;
    }

    setValueAccuracyReliability(valueAccuracyReliability) {
        this.ValueAccuracyReliability = valueAccuracyReliability;
    }

    getValueAccuracySchema() {
        return this.ValueAccuracySchema;
    }

    setValueAccuracySchema(valueAccuracySchema) {
        this.ValueAccuracySchema = valueAccuracySchema;
    }

    getValueAccuracyStatus() {
        return this.ValueAccuracyStatus;
    }

    setValueAccuracyStatus(valueAccuracyStatus) {
        this.ValueAccuracyStatus = valueAccuracyStatus;
    }

    getValueID() {
        return this.ValueID;
    }

    setValueID(valueID) {
        this.ValueID = valueID;
    }
    static FromBin(data) {
    }
    Clone() {
    };
    CompareTo(x) { };
    Create() { };
    Deserialize(sc) { };
    Dump(dw) { };
    IsValid() { };
    Read(__sc) { };
    ToString() { };
    Validate() { };
    Write(__sc) { };

}
