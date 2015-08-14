#!/bin/bash

HDF_DIR=hdf

echo "Content-type: text/html"
echo ""

# (internal) routine to store POST data
function cgi_get_POST_vars()
{
    # check content type
    # FIXME: not sure if we could handle uploads with this..
    [ "${CONTENT_TYPE}" != "application/x-www-form-urlencoded" ] && \
    echo "bash.cgi warning: you should probably use MIME type "\
         "application/x-www-form-urlencoded!" 1>&2
    # save POST variables (only first time this is called)
    [ -z "$QUERY_STRING_POST" \
      -a "$REQUEST_METHOD" = "POST" -a ! -z "$CONTENT_LENGTH" ] && \
        read -n $CONTENT_LENGTH QUERY_STRING_POST
    # prevent shell execution
    local t
    t=${QUERY_STRING_POST//%60//} # %60 = `
    t=${t//\`//}
    t=${t//\$(//}
    t=${t//%24%28//} # %24 = $, %28 = (
    QUERY_STRING_POST=${t}
    return
}

# (internal) routine to decode urlencoded strings
function cgi_decodevar()
{
    [ $# -ne 1 ] && return
    local v t h
    # replace all + with whitespace and append %%
    t="${1//+/ }%%"
    while [ ${#t} -gt 0 -a "${t}" != "%" ]; do
    v="${v}${t%%\%*}" # digest up to the first %
    t="${t#*%}"       # remove digested part
    # decode if there is anything to decode and if not at end of string
    if [ ${#t} -gt 0 -a "${t}" != "%" ]; then
        h=${t:0:2} # save first two chars
        t="${t:2}" # remove these
        v="${v}"`echo -e \\\\x${h}` # convert hex to special char
    fi
    done
    # return decoded string
    echo "${v}"
    return
}

# routine to get variables from http requests
# usage: cgi_getvars method varname1 [.. varnameN]
# method is either GET or POST or BOTH
# the magic varible name ALL gets everything
function cgi_getvars()
{
    [ $# -lt 2 ] && return
    local q p k v s
    # prevent shell execution
    t=${QUERY_STRING//%60//} # %60 = `
    t=${t//\`//}
    t=${t//\$(//}
    t=${t//%24%28//} # %24 = $, %28 = (
    QUERY_STRING=${t}
    # get query
    case $1 in
    GET)
        [ ! -z "${QUERY_STRING}" ] && q="${QUERY_STRING}&"
        ;;
    POST)
        cgi_get_POST_vars
        [ ! -z "${QUERY_STRING_POST}" ] && q="${QUERY_STRING_POST}&"
        ;;
    BOTH)
        [ ! -z "${QUERY_STRING}" ] && q="${QUERY_STRING}&"
        cgi_get_POST_vars
        [ ! -z "${QUERY_STRING_POST}" ] && q="${q}${QUERY_STRING_POST}&"
        ;;
    esac
    shift
    s=" $* "
    # parse the query data
    while [ ! -z "$q" ]; do
    p="${q%%&*}"  # get first part of query string
    k="${p%%=*}"  # get the key (variable name) from it
    v="${p#*=}"   # get the value from it
    q="${q#$p&*}" # strip first part from query string
    # decode and evaluate var if requested
    [ "$1" = "ALL" -o "${s/ $k /}" != "$s" ] && \
        eval "$k=\"`cgi_decodevar \"$v\"`\""
    done
    return
}

cgi_getvars BOTH ALL
echo "Selected Date = "$date

i=0
#s1='img'
#s2='meta'
#if [ "$img" = "$s1" ];
#then
echo "Extracting Imagery..."
for file in "$HDF_DIR"/CAL_LID_L1-ValStage1-V3-30.$date*
do
	python extractImagery.py $file
done
#else
#echo "Imagery Extraction Not Selected"
#fi

#if [ "$meta" = "$s2" ];
#then
echo "Extracting Metadata..."
for file in "$HDF_DIR"/CAL_LID_L1-ValStage1-V3-30.$date*
do
#		echo "$i"
	hdfs["$i"]=$file
	((i=i+1))
	python extractImagery.py $file
done

	python extractMetadata.py ${hdfs[@]}
#else
echo "Metadata Extraction Not Selected"
#fi

#echo "Done!"
